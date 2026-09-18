import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { ProductCard } from "@/components/product-card";
import { categoriesQO, subcategoriesQO, productsByCategoryQO } from "@/lib/queries";
import { useI18n, useT } from "@/lib/i18n";
import { ArrowUpRight } from "lucide-react";
import { BackButton } from "@/components/back-button";
import subPs5 from "@/assets/sub-ps5.jpg";
import subPs4 from "@/assets/sub-ps4.jpg";
import subPs3 from "@/assets/sub-ps3.jpg";
import subPs2 from "@/assets/sub-ps2.jpg";
import subXboxX from "@/assets/sub-xbox-x.jpg";
import subXboxS from "@/assets/sub-xbox-s.jpg";
import subXboxOne from "@/assets/sub-xbox-one.jpg";
import subXbox360 from "@/assets/sub-xbox-360.jpg";
import subSwitch from "@/assets/sub-switch.jpg";
import subSwitchOled from "@/assets/sub-switch-oled.jpg";
import subSwitchLite from "@/assets/sub-switch-lite.jpg";
import subSwitch2 from "@/assets/sub-switch-2.jpg";
import subMetaQuest from "@/assets/sub-meta-quest.jpg";
import subPsvr from "@/assets/sub-psvr.jpg";
import subManPs from "@/assets/sub-man-ps.jpg";
import subManXbox from "@/assets/sub-man-xbox.jpg";
import subManNintendo from "@/assets/sub-man-nintendo.jpg";
import subCasPs from "@/assets/sub-cas-ps.jpg";
import subCasXbox from "@/assets/sub-cas-xbox.jpg";
import subCasPc from "@/assets/sub-cas-pc.jpg";
import subCasUni from "@/assets/sub-cas-uni.jpg";
import subVolPs from "@/assets/sub-vol-ps.jpg";
import subVolXbox from "@/assets/sub-vol-xbox.jpg";
import subVolPc from "@/assets/sub-vol-pc.jpg";
import subJeuxPs5 from "@/assets/sub-jeux-ps5.jpg";
import subJeuxPs4 from "@/assets/sub-jeux-ps4.jpg";
import subJeuxXbox from "@/assets/sub-jeux-xbox.jpg";
import subJeuxSwitch from "@/assets/sub-jeux-switch.jpg";

const SUB_IMAGES: Record<string, string> = {
  ps5: subPs5,
  ps4: subPs4,
  ps3: subPs3,
  ps2: subPs2,
  "series-x": subXboxX,
  "series-s": subXboxS,
  "xbox-one": subXboxOne,
  "xbox-360": subXbox360,
  switch: subSwitch,
  "switch-oled": subSwitchOled,
  "switch-lite": subSwitchLite,
  "switch-2": subSwitch2,
  "meta-quest": subMetaQuest,
  "playstation-vr": subPsvr,
  "manettes-playstation": subManPs,
  "manettes-xbox": subManXbox,
  "manettes-nintendo": subManNintendo,
  "casques-playstation": subCasPs,
  "casques-xbox": subCasXbox,
  "casques-pc": subCasPc,
  "casques-universels": subCasUni,
  "volants-playstation": subVolPs,
  "volants-xbox": subVolXbox,
  "volants-pc": subVolPc,
  "jeux-ps5": subJeuxPs5,
  "jeux-ps4": subJeuxPs4,
  "jeux-xbox": subJeuxXbox,
  "jeux-switch": subJeuxSwitch,
};

export const Route = createFileRoute("/category/$slug/")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.toUpperCase()} — Alpha Store` },
      { name: "description", content: `Toute la catégorie ${params.slug} chez Alpha Store.` },
    ],
  }),
  loader: async ({ context, params }) => {
    const cats = await context.queryClient.ensureQueryData(categoriesQO);
    const cat = cats.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(subcategoriesQO),
      context.queryClient.ensureQueryData(productsByCategoryQO(cat.id)),
    ]);
    return { category: cat };
  },
  component: CategoryPage,
  errorComponent: ({ error }) => <SiteShell><div className="p-12">{error.message}</div></SiteShell>,
  notFoundComponent: () => <SiteShell><div className="p-12">Catégorie introuvable.</div></SiteShell>,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: cats = [] } = useQuery(categoriesQO);
  const category = cats.find((c) => c.slug === slug)!;
  const { locale } = useI18n();
  const t = useT();
  const { data: subs = [] } = useQuery(subcategoriesQO);
  const { data: products = [] } = useQuery({ ...productsByCategoryQO(category?.id ?? ""), enabled: !!category });
  const catName = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  const mySubs = subs.filter((s) => s.category_id === category.id);

  return (
    <SiteShell>
      <section className="max-w-[1600px] mx-auto px-4 md:px-6 pt-8 pb-6">
        <BackButton className="mb-5" />
        <nav className="eyebrow mb-5 flex gap-2">
          <Link to="/" className="hover:text-lime">{t.home}</Link>
          <span>/</span>
          <span className="text-foreground">{catName}</span>
        </nav>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight">{catName}</h1>
        {mySubs.length > 0 && (
          <p className="text-muted-foreground mt-3 text-sm">
            {mySubs.length} {t.subcategories.toLowerCase()}
          </p>
        )}
      </section>

      {mySubs.length > 0 ? (
        <section className="max-w-[1600px] mx-auto px-4 md:px-6 pb-16">
          <div className="grid grid-cols-2 gap-3 md:gap-5">
            {mySubs.map((s) => {
              const name = locale === "ar" && s.name_ar ? s.name_ar : s.name_fr;
              const img =
                (s as { cover_url?: string | null }).cover_url ??
                (s as { banner_url?: string | null }).banner_url ??
                SUB_IMAGES[s.slug] ??
                category.image_url ??
                undefined;
              return (
                <Link
                  key={s.id}
                  to="/category/$slug/$sub"
                  params={{ slug: category.slug, sub: s.slug }}
                  className="group relative block overflow-hidden rounded-2xl aspect-square sm:aspect-[4/5] shadow-[0_20px_60px_-20px_rgba(139,92,246,0.35)] hover:shadow-[0_30px_80px_-20px_rgba(168,85,247,0.55)] transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6d28d9] to-[#1e1b4b]" />
                  {img && (
                    <img
                      src={img}
                      alt={name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105 pointer-events-none"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80 pointer-events-none" />
                  <div className="absolute top-2 start-2 sm:top-3 sm:start-3 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[9px] sm:text-[10px] font-bold tracking-wider text-white pointer-events-none">
                    {catName.toUpperCase()}
                  </div>
                  <div className="absolute top-2 end-2 sm:top-3 sm:end-3 size-8 sm:size-9 rounded-full bg-white/15 backdrop-blur-md grid place-items-center text-white transition-transform duration-300 group-hover:rotate-45 group-hover:bg-white/25 pointer-events-none">
                    <ArrowUpRight className="size-3.5" />
                  </div>
                  <div className="absolute bottom-3 start-3 sm:bottom-4 sm:start-4 end-3 pointer-events-none">
                    <h3 className="font-display font-extrabold text-white text-base sm:text-2xl md:text-3xl leading-[0.95] tracking-tight drop-shadow-lg">
                      {name.toUpperCase()}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="max-w-[1600px] mx-auto pb-16">
          {products.length === 0 ? (
            <div className="p-16 text-center">
              <p className="eyebrow mb-3">{locale === "fr" ? "En stock bientôt" : "قريباً"}</p>
              <h3 className="font-display text-2xl font-bold">{t.noProducts}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      )}
    </SiteShell>
  );
}