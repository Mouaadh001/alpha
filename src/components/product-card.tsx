import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";

export function ProductCard({ product }: { product: Product }) {
  const { locale } = useI18n();
  const name = locale === "ar" && product.name_ar ? product.name_ar : product.name_fr;
  const variant =
    (locale === "ar" && product.short_description_ar ? product.short_description_ar : product.short_description_fr) ||
    product.brand ||
    "Slim Standard";
  const displayPriceValue =
    product.price_da_option_2 && product.price_da_option_2 > 0
      ? Math.min(product.price_da, product.price_da_option_2)
      : product.price_da;
  const price = Math.round(displayPriceValue).toLocaleString(locale === "ar" ? "ar-DZ" : "fr-DZ").replace(/,/g, " ");
  const inStock = product.stock > 0;

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group relative flex h-full min-h-[318px] flex-col overflow-hidden rounded-[20px] border border-product-card-border bg-white text-neutral-900 shadow-[0_14px_36px_-22px_rgba(0,0,0,0.9)] transition-[transform,box-shadow,border-color] duration-300 ease-out will-change-transform hover:-translate-y-1 hover:border-product-card-accent hover:shadow-[0_22px_58px_-24px_rgba(168,85,247,0.7)] active:-translate-y-1 active:scale-[0.985] active:border-product-card-accent active:shadow-[0_18px_48px_-22px_rgba(168,85,247,0.75)] md:min-h-[360px]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 ring-1 ring-product-card-accent/60 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100" />

      <div className="relative flex min-h-0 flex-[5] overflow-hidden bg-white p-1.5">
        {!inStock && (
          <span className="absolute start-2.5 top-2.5 z-10 rounded-full bg-product-card px-2 py-1 text-[8px] font-black uppercase leading-none tracking-widest text-product-card-accent ring-1 ring-product-card-border">
            {locale === "fr" ? "RUPTURE" : "نفد"}
          </span>
        )}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.025] group-active:scale-[1.02]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{product.brand ?? "Alpha"}</span>
          </div>
        )}
      </div>

      <div className="flex min-h-[110px] flex-[2] flex-col bg-white px-3 pb-3 pt-2 text-neutral-900">
        <h3 className="line-clamp-1 text-[13px] font-semibold leading-[1.3] tracking-normal text-neutral-900 md:text-sm">
          {name}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-500">
          {variant}
        </p>
        <div className="mt-auto flex items-end gap-1 pt-3 font-display font-black leading-none tracking-normal text-neutral-900">
          <span className="text-[24px]">{price}</span>
          <span className="pb-0.5 text-[17px] font-black text-product-card-accent">{locale === "ar" ? "د.ج" : "DA"}</span>
        </div>
      </div>
    </Link>
  );
}