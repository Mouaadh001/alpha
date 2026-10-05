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

export function CategoryTile({ category, index = 0 }: { category: Category; index?: number }) {
  const { locale } = useI18n();
  const name = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  const img = category.image_url ?? IMAGES[category.slug] ?? undefined;

  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group block w-full rounded-3xl p-[1.5px] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]
                 bg-gradient-to-b from-purple-400/70 via-white/10 to-lime/40
                 shadow-[0_12px_40px_-18px_rgba(168,85,247,0.55)] hover:shadow-[0_18px_50px_-15px_rgba(168,85,247,0.8)]"
    >
      <div
        className="relative overflow-hidden rounded-[calc(1.5rem-1.5px)]"
        style={{
          aspectRatio: "4 / 5",
          background:
            "radial-gradient(circle at 50% 35%, #ffffff 0%, #ece7ff 55%, #d8cdff 100%)",
        }}
      >
        {/* ground shadow (does not float) */}
        <div className="absolute left-1/2 bottom-[22%] h-3 w-[55%] -translate-x-1/2 rounded-[50%] bg-[#2a1a5e]/25 blur-md" />

        {/* floating product: blend on this wrapper so the white image bg vanishes into the card */}
        {img && (
          <div
            className="absolute inset-0 flex items-center justify-center px-5 pt-5 pb-16 animate-float-slow will-change-transform"
            style={{ mixBlendMode: "multiply", animationDelay: `${(index % 5) * 0.35}s` }}
          >
            <img
              src={img}
              alt={name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
            />
          </div>
        )}

        {/* name bar */}
        <div className="absolute inset-x-0 bottom-0 bg-[#140a2e]/90 backdrop-blur-sm px-3 py-3 text-center">
          <span className="block text-white font-black text-[11px] sm:text-sm uppercase tracking-widest leading-tight">
            {name}
          </span>
        </div>
      </div>
    </Link>
  );
}