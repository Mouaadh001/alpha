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
      className="group relative block w-full overflow-hidden rounded-3xl border border-white/15 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/60 active:scale-[0.98]"
      style={{
        aspectRatio: "3 / 4",
        background:
          "radial-gradient(circle at 50% 45%, rgba(168,85,247,0.35) 0%, rgba(30,20,60,0.9) 55%, #0b0b1a 100%)",
        boxShadow: "0 18px 40px -20px rgba(168,85,247,0.6)",
      }}
    >
      {/* name on top */}
      <div className="absolute inset-x-0 top-0 z-10 px-3 pt-5 text-center">
        <span className="block font-display text-base font-black uppercase tracking-[0.25em] text-white sm:text-lg">
          {name}
        </span>
      </div>

      {/* floating product */}
      {img && (
        <div
          className="absolute inset-0 flex items-center justify-center px-4 pb-6 pt-16 animate-float-slow will-change-transform"
          style={{ animationDelay: `${(index % 5) * 0.35}s` }}
        >
          <img
            src={img}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain drop-shadow-[0_25px_30px_rgba(0,0,0,0.55)] transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </div>
      )}
    </Link>
  );
}