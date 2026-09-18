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
      className={`group relative block overflow-hidden rounded-3xl aspect-[16/10] shadow-[0_20px_60px_-20px_rgba(139,92,246,0.35)] transition-transform duration-200 ease-out will-change-transform hover:-translate-y-1 hover:scale-[1.03]`}
    >
      {!img && <div className={`absolute inset-0 bg-gradient-to-br ${tint}`} />}
      {img && (
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.06] will-change-transform"
        />
      )}

      {/* Top pill */}
      <div className="absolute top-3 start-3 sm:top-4 sm:start-4 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold tracking-wider text-white">
        {label}
      </div>
      {/* Top arrow */}
      <div className="absolute top-3 end-3 sm:top-4 sm:end-4 size-9 sm:size-10 rounded-full bg-white/15 backdrop-blur-md grid place-items-center text-white transition-transform duration-200 ease-out group-hover:rotate-45">
        <ArrowUpRight className="size-4" />
      </div>
      {/* Bottom giant title */}
      <div className="absolute bottom-3 start-3 sm:bottom-5 sm:start-5 end-3">
        <h3 className="font-display font-extrabold text-white text-2xl sm:text-4xl md:text-5xl leading-[0.9] tracking-tight drop-shadow-lg">
          {name.toUpperCase()}
        </h3>
      </div>
    </Link>
  );
}