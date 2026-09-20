import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { ProductCard } from "@/components/product-card";
import { categoriesQO, productsByCategoryQO } from "@/lib/queries";
import { useI18n, useT } from "@/lib/i18n";
import { BackButton } from "@/components/back-button";

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

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: cats = [] } = useQuery(categoriesQO);
  const category = cats.find((c) => c.slug === slug)!;
  const { locale } = useI18n();
  const t = useT();
  const { data: products = [] } = useQuery({ ...productsByCategoryQO(category?.id ?? ""), enabled: !!category });
  const catName = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;

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
        <p className="text-muted-foreground mt-3 text-sm">
          {products.length} {locale === "fr" ? "produit(s)" : "منتج"}
        </p>
      </section>

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
    </SiteShell>
  );
}