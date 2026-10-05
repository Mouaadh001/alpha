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

// Brand colors for known categories
const BRAND_COLORS: Record<string, string> = {
  playstation: "#0070cc",
  xbox: "#107c10",
  nintendo: "#e4000f",
  vr: "#6d28d9",
  "consoles-retro": "#a21caf",
  manettes: "#7c3aed",
  jeux: "#be185d",
  volants: "#d97706",
  casques: "#0f766e",
  accessoires: "#2563eb",
};

// Palette for categories the client creates later
const PALETTE = ["#0070cc", "#107c10", "#e4000f", "#6d28d9", "#be185d", "#d97706", "#0f766e", "#2563eb"];

function colorFor(slug: string) {
  if (BRAND_COLORS[slug]) return BRAND_COLORS[slug];
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function CategoryTile({ category, index = 0 }: { category: Category; index?: number }) {
  const { locale } = useI18n();
  const name = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  // client's uploaded image first, local default second
  const img = category.image_url || DEFAULT_IMAGES[category.slug] || undefined;
  const color = colorFor(category.slug);

  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group block w-full"
    >
      {/* whole card floats slowly, staggered per tile */}
      <div
        className="animate-float-slow will-change-transform"
        style={{ animationDelay: `${(index % 5) * 0.35}s` }}
      >
        <div
          className="relative overflow-hidden rounded-3xl border-2 transition-transform duration-300 group-hover:scale-[1.03] group-active:scale-[0.98]"
          style={{
            aspectRatio: "3 / 4",
            borderColor: `${color}aa`,
            background: `linear-gradient(160deg, ${color} 0%, ${color}99 100%)`,
            boxShadow: `0 18px 40px -18px ${color}`,
          }}
        >
          {/* object-cover: any image size or format fills the card, no empty box */}
          {img && (
            <img
              src={img}
              alt={name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          )}

          {/* colored tint at the bottom so the name is always readable */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background: `linear-gradient(to top, ${color} 0%, ${color}99 45%, transparent 100%)`,
            }}
          />

          {/* name; if there is no image it sits centered on the colored card */}
          <div
            className={
              img
                ? "absolute inset-x-0 bottom-0 px-3 pb-4 text-center"
                : "absolute inset-0 flex items-center justify-center px-3 text-center"
            }
          >
            <span className="block font-display text-base font-black uppercase tracking-[0.2em] text-white drop-shadow sm:text-lg">
              {name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}