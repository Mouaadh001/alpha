import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { ProductCard } from "@/components/product-card";
import { categoriesQO, productsByCategoryQO } from "@/lib/queries";
import { useI18n, useT } from "@/lib/i18n";
import { BackButton } from "@/components/back-button";
import { Reveal } from "@/components/reveal";

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
    await context.queryClient.ensureQueryData(productsByCategoryQO(cat.id));
    return { category: cat };
  },
  component: CategoryPage,
  errorComponent: ({ error }) => <SiteShell><div className="p-12">{(error as Error).message}</div></SiteShell>,
  notFoundComponent: () => <SiteShell><div className="p-12">Catégorie introuvable.</div></SiteShell>,
});

/* Per-brand vivid bg colours — same as CategoryTile */
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

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: cats = [] } = useQuery(categoriesQO);
  const category = cats.find((c) => c.slug === slug)!;
  const { locale } = useI18n();
  const t = useT();
  const { data: products = [] } = useQuery({ ...productsByCategoryQO(category?.id ?? ""), enabled: !!category });
  const catName = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  const bg = BG_COLORS[slug] ?? "#6d28d9";

  return (
    <SiteShell>
      {/* ── Category Hero Banner ── */}
      <div
        className="relative overflow-hidden border-b border-white/10"
        style={{
          background: `linear-gradient(135deg, ${bg}dd 0%, ${bg}88 60%, #07071180 100%)`,
        }}
      >
        {/* noise texture */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "180px",
          }}
        />
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 pt-8 pb-12">
          <BackButton className="mb-5 opacity-80" />
          <nav className="text-[11px] font-mono tracking-wider uppercase text-white/50 mb-4 flex gap-2">
            <Link to="/" className="hover:text-white transition-colors">{t.home}</Link>
            <span>/</span>
            <span className="text-white/80">{catName}</span>
          </nav>
          <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl tracking-tight text-white drop-shadow-lg uppercase">
            {catName}
          </h1>
          <p className="text-white/60 mt-3 text-sm font-mono">
            {products.length} {locale === "fr" ? "produit(s) disponible(s)" : "منتج متاح"}
          </p>
        </div>
        {/* bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#070711] to-transparent pointer-events-none" />
      </div>

      {/* ── Products Grid ── */}
      <section className="max-w-[1600px] mx-auto pb-20 pt-8 px-4 md:px-6">
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="eyebrow mb-3">{locale === "fr" ? "En stock bientôt" : "قريباً"}</p>
            <h3 className="font-display text-2xl font-bold">{t.noProducts}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 5) * 40}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}