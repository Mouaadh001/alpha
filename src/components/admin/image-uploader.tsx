import { useCallback, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadImage, deleteImage } from "@/lib/admin-upload";
import { getErrorMessage } from "@/lib/errors";

type Bucket = "product-images" | "category-images";

const WEBP_QUALITY = 0.85;
const MAX_DIMENSION = 2000; // px, longest side

/** Encodes a canvas as WebP. Returns null if the browser can't produce WebP. */
function canvasToWebp(canvas: HTMLCanvasElement, quality = WEBP_QUALITY): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b && b.type === "image/webp" ? b : null), "image/webp", quality),
  );
}

/**
 * Converts any image (JPG, PNG, AVIF, GIF, BMP...) to a .webp File.
 * Keeps transparency. Downscales very large images.
 * Already-WebP files are returned untouched. If conversion fails, the original is returned.
 */
async function toWebpFile(input: File | Blob, fallbackName = "image"): Promise<File> {
  const rawName = input instanceof File ? input.name : fallbackName;
  const baseName = rawName.replace(/\.[^.]+$/, "") || "image";

  if (input.type === "image/webp") {
    return input instanceof File ? input : new File([input], `${baseName}.webp`, { type: "image/webp" });
  }

  try {
    const bmp = await createImageBitmap(input);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(bmp, 0, 0, w, h);
    const webp = await canvasToWebp(canvas);
    if (!webp) throw new Error("webp encoding not supported");
    return new File([webp], `${baseName}.webp`, { type: "image/webp" });
  } catch (e) {
    console.error("WebP conversion failed, using original file", e);
    return input instanceof File ? input : new File([input], rawName, { type: input.type });
  }
}

/** True if the image already has a real transparent background (e.g. a cutout PNG/WEBP/AVIF). */
async function hasTransparentBackground(file: File): Promise<boolean> {
  if (!file.type.startsWith("image/")) return false;
  const bmp = await createImageBitmap(file);
  // downscale so the check is fast on big images
  const scale = Math.min(1, 200 / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;
  ctx.drawImage(bmp, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  // look at the border pixels: a cutout has transparent corners/edges
  let transparent = 0;
  let total = 0;
  const check = (x: number, y: number) => {
    total++;
    if (data[(y * w + x) * 4 + 3] < 20) transparent++;
  };
  for (let x = 0; x < w; x++) { check(x, 0); check(x, h - 1); }
  for (let y = 0; y < h; y++) { check(0, y); check(w - 1, y); }
  return total > 0 && transparent / total > 0.6;
}

/**
 * Crops tightly around the product so it fills the whole image.
 * solidify = true only for results of the AI cutout (cleans faint haze, makes the product solid).
 * Images that were already transparent are NOT touched, only cropped.
 * Output is a lossless PNG intermediate; it is converted to WebP afterwards.
 */
async function trimTransparent(blob: Blob, solidify: boolean, paddingRatio = 0.02): Promise<Blob> {
  const bmp = await createImageBitmap(blob);
  const w = bmp.width;
  const h = bmp.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return blob;
  ctx.drawImage(bmp, 0, 0);
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;

  if (solidify) {
    for (let i = 3; i < data.length; i += 4) {
      const a = data[i];
      if (a <= 60) data[i] = 0; // faint haze: remove, so it can't widen the crop
      else if (a >= 140) data[i] = 255; // solid product
      else data[i] = Math.min(255, Math.round((a - 60) * (255 / 80))); // soft edge
    }
    ctx.putImageData(img, 0, 0);
  }

  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 128) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return blob; // nothing visible, keep as is

  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * paddingRatio);
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  const sw = Math.min(w, maxX + pad + 1) - sx;
  const sh = Math.min(h, maxY + pad + 1) - sy;

  const out = document.createElement("canvas");
  out.width = sw;
  out.height = sh;
  out.getContext("2d")?.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  return new Promise((resolve) => out.toBlob((b) => resolve(b ?? blob), "image/png"));
}

/**
 * Returns a cropped transparent WebP file.
 * If the image already has a transparent background, the AI cutout is skipped
 * and its pixels are left untouched (only cropped).
 */
async function cutOutBackground(file: File): Promise<File> {
  let cut: Blob = file;
  const alreadyTransparent = await hasTransparentBackground(file);
  if (!alreadyTransparent) {
    // loaded only when needed, so the admin bundle stays small
    const { removeBackground } = await import("@imgly/background-removal");
    cut = await removeBackground(file, {
      model: "isnet", // slower to download, but more accurate on white products
      output: { format: "image/png" },
    });
  }
  const trimmed = await trimTransparent(cut, !alreadyTransparent);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return toWebpFile(trimmed, `${baseName}.png`);
}

/**
 * Single-image uploader with preview → replace → delete flow.
 * Every image is converted to .webp before upload.
 * Uploads immediately to the given bucket and returns a signed URL via onChange.
 * For the "category-images" bucket the background is removed automatically
 * (override with the removeBg prop).
 */
export function SingleImageUploader({
  bucket,
  value,
  onChange,
  label = "Image",
  aspect = "square",
  removeBg,
}: {
  bucket: Bucket;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label?: string;
  aspect?: "square" | "wide" | "banner";
  removeBg?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [drag, setDrag] = useState(false);

  const shouldRemoveBg = removeBg ?? bucket === "category-images";
  const aspectCls = aspect === "wide" ? "aspect-video" : aspect === "banner" ? "aspect-[3/1]" : "aspect-square";

  const handleFiles = useCallback(async (files: FileList | File[] | null) => {
    if (!files) return;
    let file = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    setUploading(true);
    try {
      setProcessing(true);
      try {
        if (shouldRemoveBg) {
          try {
            file = await cutOutBackground(file);
          } catch (e) {
            // if the cutout fails, upload the original instead of blocking the client
            toast.warning("Suppression du fond impossible, image originale utilisée");
            console.error(e);
          }
        }
        // Always end up with .webp (no-op if the cutout already produced one)
        file = await toWebpFile(file);
      } finally {
        setProcessing(false);
      }
      // Delete previous file if it's ours
      if (value) await deleteImage(bucket, value).catch(() => {});
      const url = await uploadImage(bucket, file);
      onChange(url);
      toast.success("Image envoyée");
    } catch (e) {
      toast.error(getErrorMessage(e, "Échec de l'envoi"));
    } finally {
      setUploading(false);
    }
  }, [bucket, value, onChange, shouldRemoveBg]);

  const remove = async () => {
    if (!value) return;
    await deleteImage(bucket, value).catch(() => {});
    onChange(null);
    toast.success("Image supprimée");
  };

  const busyOverlay = (
    <div className="absolute inset-0 bg-background/70 grid place-items-center">
      <div className="flex flex-col items-center gap-2 text-center px-2">
        <Loader2 className="size-5 animate-spin text-accent" />
        {processing && (
          <span className="text-[10px] text-muted-foreground">Traitement de l'image…</span>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 font-mono">{label}</div>
      {value ? (
        <div className={`relative ${aspectCls} rounded-xl overflow-hidden border border-hairline bg-muted group`}>
          <img
            src={value}
            alt=""
            className={`w-full h-full ${shouldRemoveBg ? "object-contain" : "object-cover"}`}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center gap-2">
            <label className="cursor-pointer text-xs px-4 py-2 rounded-full bg-white text-black font-semibold flex items-center gap-2">
              <Upload className="size-3.5" /> Remplacer
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} disabled={uploading} />
            </label>
            <button type="button" onClick={remove} className="text-xs px-4 py-2 rounded-full bg-destructive text-white font-semibold flex items-center gap-2">
              <X className="size-3.5" /> Supprimer
            </button>
          </div>
          {uploading && busyOverlay}
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); void handleFiles(e.dataTransfer.files); }}
          className={`block cursor-pointer ${aspectCls} rounded-xl border-2 border-dashed transition-colors grid place-items-center text-center px-4 ${drag ? "border-accent bg-accent/5" : "border-border bg-muted/40 hover:border-accent/60"}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-6 animate-spin text-accent" />
              {processing && (
                <span className="text-[10px] text-muted-foreground">Traitement de l'image…</span>
              )}
            </div>
          ) : (
            <div>
              <ImageIcon className="size-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xs font-semibold">Glissez une image ici</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {shouldRemoveBg
                  ? "Idéal : PNG / WebP / AVIF sans fond. Sinon le fond est supprimé automatiquement"
                  : "ou cliquez pour choisir (converti en WebP)"}
              </div>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} disabled={uploading} />
        </label>
      )}
    </div>
  );
}

/**
 * Multi-image gallery uploader with drag-drop, preview, reorder, cover selection.
 * Every image is converted to .webp before upload.
 * Manages an internal upload queue and exposes ordered URL array via onChange.
 */
export function MultiImageUploader({
  bucket,
  value,
  onChange,
  coverIndex = 0,
  onCoverChange,
}: {
  bucket: Bucket;
  value: string[];
  onChange: (urls: string[]) => void;
  coverIndex?: number;
  onCoverChange?: (i: number) => void;
}) {
  const [uploading, setUploading] = useState(0);
  const [drag, setDrag] = useState(false);

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    setUploading((n) => n + arr.length);
    const results: string[] = [];
    for (const f of arr) {
      try {
        const webp = await toWebpFile(f);
        const url = await uploadImage(bucket, webp);
        results.push(url);
      } catch (e) {
        toast.error(getErrorMessage(e, "Échec de l'envoi"));
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (results.length) {
      onChange([...value, ...results]);
      toast.success(`${results.length} image(s) envoyée(s)`);
    }
  };

  const remove = async (i: number) => {
    const url = value[i];
    await deleteImage(bucket, url).catch(() => {});
    const next = value.filter((_, idx) => idx !== i);
    onChange(next);
    if (onCoverChange && coverIndex === i) onCoverChange(0);
    else if (onCoverChange && coverIndex > i) onCoverChange(coverIndex - 1);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    if (onCoverChange && coverIndex === i) onCoverChange(j);
    else if (onCoverChange && coverIndex === j) onCoverChange(i);
  };

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); void handleFiles(e.dataTransfer.files); }}
        className={`block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${drag ? "border-accent bg-accent/5" : "border-border bg-muted/40 hover:border-accent/60"}`}
      >
        <Upload className="size-6 mx-auto mb-2 text-muted-foreground" />
        <div className="text-sm font-semibold">Glissez-déposez vos images</div>
        <div className="text-xs text-muted-foreground mt-1">JPG, PNG, AVIF… — plusieurs à la fois, convertis en WebP</div>
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </label>
      {uploading > 0 && (
        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="size-3 animate-spin" /> Envoi de {uploading} image(s)…</div>
      )}
      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((src, i) => (
            <div key={src + i} className="relative aspect-square rounded-lg overflow-hidden border border-hairline bg-muted group">
              <img src={src} alt="" className="w-full h-full object-cover" />
              {onCoverChange && (
                <button type="button" onClick={() => onCoverChange(i)} className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${coverIndex === i ? "bg-accent text-white" : "bg-black/60 text-white opacity-0 group-hover:opacity-100"}`}>
                  {coverIndex === i ? "COVER" : "Faire cover"}
                </button>
              )}
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="size-6 grid place-items-center rounded bg-black/70 text-white text-xs disabled:opacity-30">←</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="size-6 grid place-items-center rounded bg-black/70 text-white text-xs disabled:opacity-30">→</button>
                <button type="button" onClick={() => remove(i)} className="size-6 grid place-items-center rounded bg-destructive text-white"><X className="size-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}