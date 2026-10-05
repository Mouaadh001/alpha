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

const TINTS: Record<string, string> = {
  playstation: "from-[#003087] to-[#001a4d]",
  xbox: "from-[#0e7a0d] to-[#052e05]",
  nintendo: "from-[#e60012] to-[#7a0008]",
  vr: "from-[#4c1d95] to-[#1e1b4b]",
  "consoles-retro": "from-[#701a75] to-[#3b0764]",
  manettes: "from-[#6b21a8] to-[#2e1065]",
  jeux: "from-[#7c3aed] to-[#3b0764]",
  volants: "from-[#9d174d] to-[#3b0764]",
  casques: "from-[#0f766e] to-[#042f2e]",
  accessoires: "from-[#1d4ed8] to-[#1e3a8a]",
};

export function CategoryTile({ category }: { category: Category }) {
  const { locale } = useI18n();
  const name = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  const img = category.image_url ?? IMAGES[category.slug] ?? undefined;
  const tint = TINTS[category.slug] ?? "from-[#6d28d9] to-[#1e1b4b]";

  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group relative block overflow-hidden rounded-xl aspect-[3/4] transition-all duration-300 ease-out will-change-transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]"
    >
      {/* Fallback tint */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tint}`} />

      {/* Full-cover image — NO padding, NO contain */}
      {img && (
        <img
          src={img}
          alt={name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 will-change-transform"
        />
      )}

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

      {/* Arrow badge */}
      <div className="absolute top-2.5 end-2.5 size-6 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center text-white transition-transform duration-200 ease-out group-hover:rotate-45">
        <ArrowUpRight className="size-3" />
      </div>

      {/* Name at bottom */}
      <div className="absolute bottom-0 inset-x-0 px-3 pb-3 pt-10">
        <h3 className="font-display font-black text-white text-sm sm:text-base leading-tight tracking-tight uppercase drop-shadow-md">
          {name}
        </h3>
      </div>
    </Link>
  );
}