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

/** Results are cached so each image is cropped only once. */
const trimCache = new Map<string, string>();

/**
 * Crops the empty transparent margins around a product image, in the browser,
 * so the product always fills its tile. Images without transparency
 * (plain JPEGs) are returned unchanged. Returns undefined while processing.
 */
function useTrimmedSrc(src?: string): string | undefined {
  const [out, setOut] = useState<string | undefined>(src ? trimCache.get(src) : undefined);

  useEffect(() => {
    if (!src) {
      setOut(undefined);
      return;
    }
    const cached = trimCache.get(src);
    if (cached) {
      setOut(cached);
      return;
    }

    let cancelled = false;
    const finish = (url: string) => {
      trimCache.set(src, url);
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
        // small copy, only to find where the product is
        const k = Math.min(1, 480 / Math.max(nw, nh));
        const w = Math.max(1, Math.round(nw * k));
        const h = Math.max(1, Math.round(nh * k));
        const probe = document.createElement("canvas");
        probe.width = w;
        probe.height = h;
        const pctx = probe.getContext("2d", { willReadFrequently: true });
        if (!pctx) return finish(src);
        pctx.drawImage(im, 0, 0, w, h);
        const { data } = pctx.getImageData(0, 0, w, h);

        let minX = w, minY = h, maxX = -1, maxY = -1;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] > 100) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        // nothing visible, or nothing to crop (opaque image)
        if (maxX < 0 || ((maxX - minX + 1) * (maxY - minY + 1)) / (w * h) > 0.92) {
          return finish(src);
        }

        const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.02);
        const fx = nw / w;
        const fy = nh / h;
        const sx = Math.max(0, Math.round((minX - pad) * fx));
        const sy = Math.max(0, Math.round((minY - pad) * fy));
        const sw = Math.min(nw - sx, Math.round((maxX - minX + 1 + pad * 2) * fx));
        const sh = Math.min(nh - sy, Math.round((maxY - minY + 1 + pad * 2) * fy));

        const ok = Math.min(1, 1000 / Math.max(sw, sh));
        const ow = Math.max(1, Math.round(sw * ok));
        const oh = Math.max(1, Math.round(sh * ok));
        const outCanvas = document.createElement("canvas");
        outCanvas.width = ow;
        outCanvas.height = oh;
        outCanvas.getContext("2d")?.drawImage(im, sx, sy, sw, sh, 0, 0, ow, oh);
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
  const img = useTrimmedSrc(rawImg);

  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group flex w-full flex-col items-center active:scale-[0.98] transition-transform"
    >
      {/* floating product: no frame, no background, always fully inside the card */}
      <div
        className="aspect-[5/4] w-full px-1 pb-3 pt-4 animate-float-slow will-change-transform md:aspect-square md:px-3"
        style={{ animationDelay: `${(index % 5) * 0.35}s` }}
      >
        {img && (
          <img
            src={img}
            alt={name}
            decoding="async"
            className="h-full w-full object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.55)] transition-transform duration-700 ease-out group-hover:scale-105"
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