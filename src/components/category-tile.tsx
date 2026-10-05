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

const IMAGES: Record<string, string> = {
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

export function CategoryTile({ category }: { category: Category }) {
  const { locale } = useI18n();
  const name = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  const img = category.image_url ?? IMAGES[category.slug] ?? undefined;

  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group flex flex-col items-center gap-3"
    >
      {/*
        Card technique to remove white image background on a dark theme:
        - Inner background is WHITE (so mix-blend-mode:multiply erases the white image bg)
        - Outer overlay is black using mix-blend-mode:multiply (turns white inner → dark)
        Net result: product appears to float with no white background on dark page.
      */}
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: "3/4", backgroundColor: "#ffffff" }}
      >
        {/* Black overlay that darkens the white bg via multiply */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ backgroundColor: "#1a1a2e", mixBlendMode: "multiply" }}
        />

        {/* Floating image — the animation makes it bob up/down */}
        {img && (
          <div className="absolute inset-0 z-0 flex items-center justify-center animate-float-slow will-change-transform">
            <img
              src={img}
              alt={name}
              loading="lazy"
              decoding="async"
              className="w-[88%] h-[88%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-transform duration-700 ease-out group-hover:scale-[1.07]"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>
        )}
      </div>

      {/* Category name below — white text, no box, no frame */}
      <span className="text-white font-black text-xs sm:text-sm uppercase tracking-widest text-center leading-tight">
        {name}
      </span>
    </Link>
  );
}