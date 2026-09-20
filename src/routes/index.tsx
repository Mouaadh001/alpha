import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { ProductCard } from "@/components/product-card";
import { GamingHero } from "@/components/gaming-hero";
import { SpaceBackdrop } from "@/components/space-backdrop";
import { Reveal } from "@/components/reveal";
import { Truck, ShieldCheck, ArrowRight } from "lucide-react";
import {
  featuredProductsQO,
  latestProductsQO,
  categoriesQO,
} from "@/lib/queries";
import { useI18n, useT } from "@/lib/i18n";

export const Route = createFileRoute("/")(  {
  head: () => ({
    meta: [
      { title: "Alpha Store — Premium Gaming en Algérie" },
      { name: "description", content: "Consoles PlayStation, Xbox, Nintendo, VR, casques, manettes, volants et accessoires gaming premium. Livraison rapide dans les 58 wilayas." },
      { property: "og:title", content: "Alpha Store — Premium Gaming" },
      { property: "og:description", content: "La destination gaming premium en Algérie." },
    ],
  }),
  component: Home,
  errorComponent: ({ error }) => (
    <SiteShell><div className="max-w-3xl mx-auto p-12">Une erreur est survenue. {error.message}</div></SiteShell>
  ),
  notFoundComponent: () => <SiteShell><div className="p-12">Introuvable</div></SiteShell>,
});

export function Home() {
  const { data: featured = [] } = useQuery(featuredProductsQO);
  const { data: latest = [] } = useQuery(latestProductsQO);
  const { data: categories = [] } = useQuery(categoriesQO);
  const { locale } = useI18n();
  const t = useT();

  const catalog = latest.length ? latest : featured;
  const hasCatalog = catalog.length > 0;
  const firstCat = categories[0];

  return (
    <SiteShell>
      {/* Cinematic gaming hero */}
      <GamingHero />

      {/* Nos produits */}
      <section className="relative overflow-hidden pt-14 pb-16 mt-6">
        <SpaceBackdrop />
        <div className="relative max-w-[1600px] mx-auto">
          <div className="px-4 md:px-6 mb-6 flex items-end justify-between gap-6 flex-wrap">
            <h2 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight">
              {locale === "fr" ? "Nos produits" : "منتجاتنا"}
            </h2>
            {hasCatalog && (
              <Link
                to="/category/$slug"
                params={{ slug: firstCat?.slug ?? "playstation" }}
                className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-lime hover:opacity-80"
              >
                {t.all} <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
          {hasCatalog ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 px-4 md:px-6">
              {catalog.slice(0, 10).map((p, i) => (
                <Reveal key={p.id} delay={(i % 5) * 40}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="px-4 md:px-6 text-muted-foreground text-sm">
              {locale === "fr" ? "Aucun produit pour le moment." : "لا توجد منتجات."}
            </div>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-6 pt-10 md:pt-14 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="size-11 md:size-12 shrink-0 grid place-items-center rounded-full bg-lime/15 text-lime">
              <Truck className="size-5 md:size-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[15px] md:text-base font-bold">
                {locale === "fr" ? "Livraison disponible dans les 69 wilayas" : "التوصيل متوفر لـ 69 ولاية"}
              </div>
              <div className="text-[13px] text-muted-foreground">
                {locale === "fr" ? "Partout en Algérie, rapide et fiable" : "في كامل الجزائر، سريع وموثوق"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="size-11 md:size-12 shrink-0 grid place-items-center rounded-full bg-purple-500/15 text-purple-400">
              <ShieldCheck className="size-5 md:size-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[15px] md:text-base font-bold">
                {locale === "fr" ? "Produits garantis et 100% originaux" : "منتجات مضمونة وأصلية 100%"}
              </div>
              <div className="text-[13px] text-muted-foreground">
                {locale === "fr" ? "Qualité premium vérifiée" : "جودة عالية موثوقة"}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
