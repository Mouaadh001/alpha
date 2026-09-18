import { useCallback, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadImage, deleteImage } from "@/lib/admin-upload";

type Bucket = "product-images" | "category-images";

/**
 * Single-image uploader with preview → replace → delete flow.
 * Uploads immediately to the given bucket and returns a signed URL via onChange.
 */
export function SingleImageUploader({
  bucket,
  value,
  onChange,
  label = "Image",
  aspect = "square",
}: {
  bucket: Bucket;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label?: string;
  aspect?: "square" | "wide" | "banner";
}) {
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);

  const aspectCls = aspect === "wide" ? "aspect-video" : aspect === "banner" ? "aspect-[3/1]" : "aspect-square";

  const handleFiles = useCallback(async (files: FileList | File[] | null) => {
    if (!files) return;
    const file = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    setUploading(true);
    try {
      // Delete previous file if it's ours
      if (value) await deleteImage(bucket, value).catch(() => {});
      const url = await uploadImage(bucket, file);
      onChange(url);
      toast.success("Image envoyée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de l'envoi");
    } finally {
      setUploading(false);
    }
  }, [bucket, value, onChange]);

  const remove = async () => {
    if (!value) return;
    await deleteImage(bucket, value).catch(() => {});
    onChange(null);
    toast.success("Image supprimée");
  };

  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 font-mono">{label}</div>
      {value ? (
        <div className={`relative ${aspectCls} rounded-xl overflow-hidden border border-hairline bg-muted group`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center gap-2">
            <label className="cursor-pointer text-xs px-4 py-2 rounded-full bg-white text-black font-semibold flex items-center gap-2">
              <Upload className="size-3.5" /> Remplacer
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} disabled={uploading} />
            </label>
            <button type="button" onClick={remove} className="text-xs px-4 py-2 rounded-full bg-destructive text-white font-semibold flex items-center gap-2">
              <X className="size-3.5" /> Supprimer
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-background/70 grid place-items-center">
              <Loader2 className="size-5  text-accent" />
            </div>
          )}
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); void handleFiles(e.dataTransfer.files); }}
          className={`block cursor-pointer ${aspectCls} rounded-xl border-2 border-dashed transition-colors grid place-items-center text-center px-4 ${drag ? "border-accent bg-accent/5" : "border-border bg-muted/40 hover:border-accent/60"}`}
        >
          {uploading ? (
            <Loader2 className="size-6  text-accent" />
          ) : (
            <div>
              <ImageIcon className="size-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xs font-semibold">Glissez une image ici</div>
              <div className="text-[10px] text-muted-foreground mt-1">ou cliquez pour choisir</div>
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
        const url = await uploadImage(bucket, f);
        results.push(url);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Échec de l'envoi");
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
        <div className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — plusieurs à la fois</div>
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </label>
      {uploading > 0 && (
        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="size-3 " /> Envoi de {uploading} image(s)…</div>
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