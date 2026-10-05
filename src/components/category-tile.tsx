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

/* Vivid per-brand solid bg colour (like the yellow reference site) */
const BG_COLORS: Record<string, string> = {
  playstation: "#0070cc",
  xbox: "#107c10",
  nintendo: "#e4000f",
  vr: "#4c1d95",
  "consoles-retro": "#6b21a8",
  manettes: "#7c3aed",
  jeux: "#9d174d",
  volants: "#b45309",
  casques: "#0f766e",
  accessoires: "#1d4ed8",
};

/* Glow tint for hover ring */
const GLOWS: Record<string, string> = {
  playstation: "rgba(0,112,204,0.6)",
  xbox: "rgba(16,124,16,0.6)",
  nintendo: "rgba(228,0,15,0.6)",
  vr: "rgba(139,92,246,0.6)",
  "consoles-retro": "rgba(107,33,168,0.6)",
  manettes: "rgba(124,58,237,0.6)",
  jeux: "rgba(157,23,77,0.6)",
  volants: "rgba(180,83,9,0.6)",
  casques: "rgba(15,118,110,0.6)",
  accessoires: "rgba(29,78,216,0.6)",
};

export function CategoryTile({ category }: { category: Category; index?: number; span?: "sm" | "lg" }) {
  const { locale } = useI18n();
  const name = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  const img = category.image_url ?? IMAGES[category.slug] ?? undefined;
  const bg = BG_COLORS[category.slug] ?? "#6d28d9";
  const glow = GLOWS[category.slug] ?? "rgba(139,92,246,0.6)";

  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group relative flex flex-col items-center justify-between overflow-hidden rounded-2xl aspect-[3/4] transition-all duration-300 ease-out will-change-transform hover:-translate-y-2 hover:scale-[1.03]"
      style={{
        background: `linear-gradient(160deg, ${bg}ee 0%, ${bg}99 100%)`,
        boxShadow: `0 8px 28px -10px ${glow}`,
      }}
    >
      {/* subtle inner noise/texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px",
        }}
      />

      {/* glow ring on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 transition-opacity duration-300 group-hover:opacity-100"
        style={{ ringColor: glow, boxShadow: `inset 0 0 0 2px ${glow}` }}
      />

      {/* arrow top-right */}
      <div className="absolute top-3 end-3 size-7 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center text-white transition-transform duration-200 ease-out group-hover:rotate-45 z-20">
        <ArrowUpRight className="size-3.5" />
      </div>

      {/* floating product image — centred, takes 75% width, animate-float-slow */}
      <div className="relative z-10 flex flex-1 items-center justify-center w-full px-4 pt-8 pb-2">
        {img ? (
          <img
            src={img}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-[78%] max-h-[54%] object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)] animate-float-med will-change-transform transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white/60 text-xl font-black uppercase">{name[0]}</span>
          </div>
        )}
      </div>

      {/* name bottom — solid pill on glass */}
      <div className="relative z-10 w-full px-3 pb-4">
        <div className="rounded-xl bg-black/30 backdrop-blur-md px-3 py-2.5 flex items-center justify-between border border-white/10">
          <h3 className="font-display font-black text-white text-sm sm:text-base leading-none tracking-tight uppercase">
            {name}
          </h3>
          <span className="text-white/60 text-[10px] font-mono uppercase tracking-widest hidden sm:inline">Shop →</span>
        </div>
      </div>
    </Link>
  );
}