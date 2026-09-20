import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
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

// Per-category background tint so each tile feels distinct like the reference.
const TINTS: Record<string, string> = {
  playstation: "from-[#5b21b6] to-[#2e1065]",
  xbox: "from-[#0e7a0d] to-[#052e05]",
  nintendo: "from-[#e60012] to-[#7a0008]",
  vr: "from-[#4c1d95] to-[#1e1b4b]",
  "consoles-retro": "from-[#701a75] to-[#3b0764]",
  manettes: "from-[#6b21a8] to-[#2e1065]",
  jeux: "from-[#7c3aed] to-[#3b0764]",
  volants: "from-[#9d174d] to-[#3b0764]",
  casques: "from-[#8b5cf6] to-[#2e1065]",
  accessoires: "from-[#6d28d9] to-[#1e1b4b]",
};

export function CategoryTile({ category }: { category: Category; index?: number; span?: "sm" | "lg" }) {
  const { locale } = useI18n();
  const name = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  const img = category.image_url ?? IMAGES[category.slug] ?? undefined;
  const tint = TINTS[category.slug] ?? "from-[#6d28d9] to-[#1e1b4b]";
  const label = locale === "fr" ? `CONSOLES ${name.toUpperCase()}` : name.toUpperCase();
  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className={`group relative block overflow-hidden rounded-2xl aspect-[4/3] shadow-[0_10px_30px_-12px_rgba(139,92,246,0.4)] transition-all duration-200 ease-out will-change-transform hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_18px_48px_-14px_rgba(139,92,246,0.6)]`}
    >
      {/* gradient fallback */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tint}`} />

      {img && (
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-luminosity transition-transform duration-300 ease-out group-hover:scale-[1.08] will-change-transform"
        />
      )}

      {/* dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

      {/* arrow top-right */}
      <div className="absolute top-2.5 end-2.5 size-7 rounded-full bg-white/15 backdrop-blur-sm grid place-items-center text-white transition-transform duration-200 ease-out group-hover:rotate-45">
        <ArrowUpRight className="size-3.5" />
      </div>

      {/* name bottom */}
      <div className="absolute bottom-0 inset-x-0 px-3 pb-3 pt-6">
        <h3 className="font-display font-extrabold text-white text-base sm:text-lg leading-tight tracking-tight drop-shadow-lg">
          {name}
        </h3>
      </div>
    </Link>
  );
}