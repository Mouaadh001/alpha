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

/* Vivid brand solid backgrounds */
const BG: Record<string, string> = {
  playstation: "#d4a017",
  xbox:        "#107c10",
  nintendo:    "#e4000f",
  vr:          "#4c1d95",
  "consoles-retro": "#374151",
  manettes:    "#1e3a5f",
  jeux:        "#7f1d1d",
  volants:     "#78350f",
  casques:     "#134e4a",
  accessoires: "#1e3a8a",
};

export function CategoryTile({ category }: { category: Category }) {
  const { locale } = useI18n();
  const name = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  const img = category.image_url ?? IMAGES[category.slug] ?? undefined;
  const bg = BG[category.slug] ?? "#1e3a8a";

  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl"
      style={{ backgroundColor: bg, aspectRatio: "3/4" }}
    >
      {/* Brand label — top left, subtle */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <span className="text-white font-black text-xs sm:text-sm uppercase tracking-widest opacity-90 drop-shadow-md">
          {name}
        </span>
      </div>

      {/* Floating wrapper — handles the up/down bob animation */}
      {img && (
        <div className="absolute inset-0 flex items-center justify-center animate-float-slow will-change-transform">
          <img
            src={img}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-[90%] h-[90%] object-contain transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ mixBlendMode: "multiply" }}
          />
        </div>
      )}

      {/* Bottom gradient for text contrast if needed */}
      <div
        className="absolute bottom-0 inset-x-0 h-20 pointer-events-none z-10"
        style={{ background: `linear-gradient(to top, ${bg}bb, transparent)` }}
      />
    </Link>
  );
}