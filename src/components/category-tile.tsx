import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Category } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import psImg from "@/assets/cat-playstation.jpg";
import xboxImg from "@/assets/cat-xbox.jpg";
import ninImg from "@/assets/cat-nintendo.jpg";
import vrImg from "@/assets/cat-vr.jpg";
import retroImg from "@/assets/cat-retro.jpg";
import manImg from "@/assets/cat-manettes.jpg";
import jeuxImg from "@/assets/cat-jeux.jpg";
import volImg from "@/assets/cat-volants.jpg";
import casImg from "@/assets/cat-casques.jpg";
import accImg from "@/assets/cat-accessoires.jpg";

// Fallback images, used only when the category has no uploaded image
const DEFAULT_IMAGES: Record<string, string> = {
  playstation: psImg,
  xbox: xboxImg,
  nintendo: ninImg,
  vr: vrImg,
  "consoles-retro": retroImg,
  manettes: manImg,
  jeux: jeuxImg,
  volants: volImg,
  casques: casImg,
  accessoires: accImg,
};

/**
 * Haze cleaning (0-255 alpha):
 * pixels at or below HAZE_LOW become fully transparent,
 * pixels at or above HAZE_HIGH become fully solid, in between = soft edge.
 * If dark haze is still visible on an image, raise both numbers a little (e.g. 120 / 220).
 */
const HAZE_LOW = 90;
const HAZE_HIGH = 200;

/** Results are cached so each image is processed only once. */
const cleanCache = new Map<string, string>();

/**
 * Removes faint shadow/haze pixels and crops the empty margins around a
 * transparent product image, in the browser. Opaque images (plain JPEGs)
 * are returned unchanged. Returns undefined while processing.
 */
function useCleanSrc(src?: string): string | undefined {
  const [out, setOut] = useState<string | undefined>(src ? cleanCache.get(src) : undefined);

  useEffect(() => {
    if (!src) {
      setOut(undefined);
      return;
    }
    const cached = cleanCache.get(src);
    if (cached) {
      setOut(cached);
      return;
    }

    let cancelled = false;
    const finish = (url: string) => {
      cleanCache.set(src, url);
      if (!cancelled) setOut(url);
    };

    const im = new Image();
    im.crossOrigin = "anonymous";
    im.decoding = "async";
    im.onerror = () => finish(src); // e.g. no CORS: show the image as it is
    im.onload = () => {
      try {
        const nw = im.naturalWidth;
        const nh = im.naturalHeight;
        const k = Math.min(1, 1000 / Math.max(nw, nh));
        const w = Math.max(1, Math.round(nw * k));
        const h = Math.max(1, Math.round(nh * k));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return finish(src);
        ctx.drawImage(im, 0, 0, w, h);
        const img = ctx.getImageData(0, 0, w, h);
        const d = img.data;

        // opaque image (JPEG etc.): nothing to clean
        let seeThrough = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] < 250) seeThrough++;
        if (seeThrough / (w * h) < 0.01) return finish(src);

        // remove faint haze, make the product solid
        for (let i = 3; i < d.length; i += 4) {
          const a = d[i];
          if (a <= HAZE_LOW) d[i] = 0;
          else if (a >= HAZE_HIGH) d[i] = 255;
          else d[i] = Math.round(((a - HAZE_LOW) * 255) / (HAZE_HIGH - HAZE_LOW));
        }
        ctx.putImageData(img, 0, 0);

        // find where the product is
        let minX = w, minY = h, maxX = -1, maxY = -1;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (d[(y * w + x) * 4 + 3] > 128) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        if (maxX < 0) return finish(src);

        const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.02);
        const sx = Math.max(0, minX - pad);
        const sy = Math.max(0, minY - pad);
        const sw = Math.min(w - sx, maxX - minX + 1 + pad * 2);
        const sh = Math.min(h - sy, maxY - minY + 1 + pad * 2);

        const outCanvas = document.createElement("canvas");
        outCanvas.width = sw;
        outCanvas.height = sh;
        outCanvas.getContext("2d")?.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
        outCanvas.toBlob((blob) => finish(blob ? URL.createObjectURL(blob) : src), "image/png");
      } catch {
        finish(src);
      }
    };
    im.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return out;
}

export function CategoryTile({ category, index = 0 }: { category: Category; index?: number }) {
  const { locale } = useI18n();
  const name = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  // client's uploaded image first, local default second
  const rawImg = category.image_url || DEFAULT_IMAGES[category.slug] || undefined;
  const img = useCleanSrc(rawImg);

  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group flex w-full flex-col items-center active:scale-[0.98] transition-transform"
    >
      {/* floating product: no frame, no background */}
      <div
        className="aspect-[5/4] w-full px-2 pb-3 pt-4 animate-float-slow will-change-transform md:aspect-square md:px-3"
        style={{ animationDelay: `${(index % 5) * 0.35}s` }}
      >
        {img && (
          <img
            src={img}
            alt={name}
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
      </div>

      {/* category name */}
      <span className="mt-2 text-center font-display text-base font-black uppercase tracking-[0.25em] text-white sm:text-lg">
        {name}
      </span>
    </Link>
  );
}