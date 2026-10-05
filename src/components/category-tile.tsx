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

/*
 * Brand bg colors — vivid, like the reference yellow site.
 * The product images have white/light backgrounds so we use object-contain
 * and let the brand color show around the product.
 */
const BG: Record<string, string> = {
  playstation: "#003087",    // PS deep blue
  xbox:        "#107c10",    // Xbox green
  nintendo:    "#e4000f",    // Nintendo red
  vr:          "#1a0533",    // Deep purple VR
  "consoles-retro": "#1a1a2e", // Dark retro
  manettes:    "#0d0d1a",    // Dark manettes
  jeux:        "#6b0f1a",    // Dark red jeux
  volants:     "#1a0a00",    // Dark amber volants
  casques:     "#001a2e",    // Dark teal casques
  accessoires: "#0a1628",    // Dark blue acc
};

/*
 * Light accent color used for the label chip at the bottom.
 */
const ACCENT: Record<string, string> = {
  playstation: "#0070cc",
  xbox:        "#19c319",
  nintendo:    "#ff2a38",
  vr:          "#7c3aed",
  "consoles-retro": "#6b7280",
  manettes:    "#a855f7",
  jeux:        "#e11d48",
  volants:     "#d97706",
  casques:     "#0891b2",
  accessoires: "#2563eb",
};

export function CategoryTile({ category }: { category: Category }) {
  const { locale } = useI18n();
  const name = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  const img = category.image_url ?? IMAGES[category.slug] ?? undefined;
  const bg = BG[category.slug] ?? "#0d0d1a";
  const accent = ACCENT[category.slug] ?? "#7c3aed";

  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl aspect-[3/4] transition-all duration-300 ease-out will-change-transform hover:-translate-y-1.5 hover:scale-[1.02]"
      style={{
        backgroundColor: bg,
        boxShadow: `0 8px 32px -10px ${accent}55`,
      }}
    >
      {/* Subtle top vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accent}22 0%, transparent 70%)`,
        }}
      />

      {/* Glow ring on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 2px ${accent}88` }}
      />

      {/* Product image — object-contain so it floats on the brand colour */}
      <div className="relative flex-1 flex items-center justify-center p-4 pb-2">
        {img ? (
          <img
            src={img}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.07] group-hover:-translate-y-1 will-change-transform drop-shadow-[0_16px_32px_rgba(0,0,0,0.7)]"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white/60 text-2xl font-black uppercase"
            style={{ background: `${accent}33` }}
          >
            {name[0]}
          </div>
        )}
      </div>

      {/* Category name chip at bottom */}
      <div className="relative z-10 px-3 pb-3">
        <div
          className="rounded-xl px-3 py-2.5 flex items-center justify-between"
          style={{ backgroundColor: `${accent}22`, border: `1px solid ${accent}44` }}
        >
          <span className="font-display font-black text-white text-sm leading-none tracking-tight uppercase">
            {name}
          </span>
          <span
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: accent }}
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}