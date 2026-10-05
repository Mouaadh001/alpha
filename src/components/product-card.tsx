import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { Zap, Star } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { locale } = useI18n();
  const name =
    locale === "ar" && product.name_ar ? product.name_ar : product.name_fr;

  const inStock = product.stock > 0;
  const isNew = product.is_new;
  const isBestseller = product.is_bestseller;

  /* ── prices ── */
  const price1 = Math.round(product.price_da);
  const price2 =
    product.price_da_option_2 && product.price_da_option_2 > 0
      ? Math.round(product.price_da_option_2)
      : null;
  const minPrice = price2 ? Math.min(price1, price2) : price1;
  const compareAt =
    product.compare_at_price_da && product.compare_at_price_da > minPrice
      ? Math.round(product.compare_at_price_da)
      : null;
  const hasDiscount = !!compareAt;

  const fmt = (n: number) =>
    n.toLocaleString(locale === "ar" ? "ar-DZ" : "fr-DZ").replace(/,/g, "\u202f");

  /* ── storage options ── */
  const opts: { label: string; price: number }[] = [];
  if (product.storage_option_1) opts.push({ label: product.storage_option_1, price: price1 });
  if (product.storage_option_2 && price2) opts.push({ label: product.storage_option_2, price: price2 });

  /* ── discount % ── */
  const discountPct = compareAt
    ? Math.round(((compareAt - minPrice) / compareAt) * 100)
    : 0;

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f0f14] text-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.8)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-purple-500/30 hover:shadow-[0_20px_48px_-16px_rgba(168,85,247,0.45)] active:scale-[0.985]"
    >
      {/* ── IMAGE ── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-[#1c1c2e] to-[#0f0f18]">
        {product.image_url ? (
          <>
            {/* Soft radial glow behind product */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2/3 h-2/3 rounded-full bg-purple-500/10 blur-2xl" />
            </div>
            <img
              src={product.image_url}
              alt={name}
              loading="lazy"
              decoding="async"
              className="relative z-10 h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.08] group-hover:-translate-y-1 will-change-transform drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
            />
          </>
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
              {product.brand ?? "Alpha"}
            </span>
          </div>
        )}

        {/* bottom gradient fade into card */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#0f0f14] to-transparent pointer-events-none z-20" />

        {/* top-left badges */}
        <div className="absolute top-2.5 start-2.5 flex flex-col gap-1.5 z-30">
          {!inStock && (
            <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-400">
              {locale === "fr" ? "Rupture" : "نفد"}
            </span>
          )}
          {isNew && inStock && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/25 border border-purple-400/30 backdrop-blur-sm px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-purple-300">
              <Zap className="size-2.5" />
              {locale === "fr" ? "Nouveau" : "جديد"}
            </span>
          )}
          {isBestseller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/30 backdrop-blur-sm px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-300">
              <Star className="size-2.5 fill-amber-300" />
              {locale === "fr" ? "Best-seller" : "الأكثر مبيعاً"}
            </span>
          )}
        </div>

        {/* discount badge top-right */}
        {hasDiscount && (
          <span className="absolute top-2.5 end-2.5 z-30 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black leading-none text-white shadow-lg">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* ── INFO ── */}
      <div className="flex flex-1 flex-col gap-1.5 px-3.5 pt-2.5 pb-3.5">
        {/* brand */}
        {product.brand && (
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-purple-400/80">
            {product.brand}
          </p>
        )}

        {/* name */}
        <h3 className="line-clamp-2 text-[13px] font-bold leading-[1.3] text-white md:text-sm">
          {name}
        </h3>

        {/* storage / GB pills */}
        {opts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {opts.map((o) => (
              <span
                key={o.label}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/70"
              >
                {o.label}
              </span>
            ))}
          </div>
        )}

        {/* short description */}
        {(product.short_description_fr || product.short_description_ar) && (
          <p className="line-clamp-1 text-[10px] text-white/45 leading-snug">
            {locale === "ar" && product.short_description_ar
              ? product.short_description_ar
              : product.short_description_fr}
          </p>
        )}

        {/* price row */}
        <div className="mt-auto flex items-end gap-2 pt-2">
          <span className="font-display text-[22px] font-black leading-none text-white">
            {fmt(minPrice)}
          </span>
          <span className="pb-0.5 text-[15px] font-black text-purple-400">
            {locale === "ar" ? "د.ج" : "DA"}
          </span>
          {compareAt && (
            <span className="pb-0.5 text-[11px] font-semibold text-white/35 line-through">
              {fmt(compareAt)}
            </span>
          )}
        </div>

        {/* starting from label when two storage options */}
        {opts.length > 1 && (
          <p className="text-[9px] text-white/40 -mt-1">
            {locale === "fr" ? "À partir de" : "ابتداءً من"}
          </p>
        )}
      </div>

      {/* hover glow ring */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-purple-500/50 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
}