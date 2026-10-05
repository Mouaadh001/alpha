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

export function CategoryTile({ category, index = 0 }: { category: Category; index?: number }) {
  const { locale } = useI18n();
  const name = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  // client's uploaded image first, local default second
  const img = category.image_url || DEFAULT_IMAGES[category.slug] || undefined;

  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group flex w-full flex-col items-center active:scale-[0.98] transition-transform"
    >
      {/* floating product: no frame, no background, fills the full width */}
      <div
        className="aspect-square w-full animate-float-slow will-change-transform"
        style={{ animationDelay: `${(index % 5) * 0.35}s` }}
      >
        {img && (
          <img
            src={img}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain drop-shadow-[0_25px_30px_rgba(0,0,0,0.55)] transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
      </div>

      {/* category name */}
      <span className="mt-1 text-center font-display text-base font-black uppercase tracking-[0.25em] text-white sm:text-lg">
        {name}
      </span>
    </Link>
  );
}