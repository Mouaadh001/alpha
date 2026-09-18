import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { ProductCard } from "@/components/product-card";
import { categoriesQO, subcategoriesQO, productsBySubcategoryQO } from "@/lib/queries";
import { useI18n, useT } from "@/lib/i18n";
import { BackButton } from "@/components/back-button";

export const Route = createFileRoute("/category/$slug/$sub")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.sub} — ${params.slug} — Alpha Store` },
      { name: "description", content: `${params.sub} chez Alpha Store.` },
    ],
  }),
  loader: async ({ context, params }) => {
    const [cats, subs] = await Promise.all([
      context.queryClient.ensureQueryData(categoriesQO),
      context.queryClient.ensureQueryData(subcategoriesQO),
    ]);
    const cat = cats.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    const sub = subs.find((s) => s.slug === params.sub && s.category_id === cat.id);
    if (!sub) throw notFound();
    await context.queryClient.ensureQueryData(productsBySubcategoryQO(sub.id));
    return { category: cat, subcategory: sub };
  },
  component: SubPage,
  errorComponent: ({ error }) => <SiteShell><div className="p-12">{error.message}</div></SiteShell>,
  notFoundComponent: () => <SiteShell><div className="p-12">Sous-catégorie introuvable.</div></SiteShell>,
});

function SubPage() {
  const params = Route.useParams();
  const { data: cats = [] } = useQuery(categoriesQO);
  const { data: allSubs = [] } = useQuery(subcategoriesQO);
  const category = cats.find((c) => c.slug === params.slug)!;
  const subcategory = allSubs.find((s) => s.slug === params.sub && s.category_id === category?.id)!;
  const { locale } = useI18n();
  const t = useT();
  const { data: products = [] } = useQuery({ ...productsBySubcategoryQO(subcategory?.id ?? ""), enabled: !!subcategory });
  const catName = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  const subName = locale === "ar" && subcategory.name_ar ? subcategory.name_ar : subcategory.name_fr;

  return (
    <SiteShell>
      <section className="border-b border-hairline">
        <div className="max-w-[1600px] mx-auto px-6 py-16">
          <BackButton className="mb-5" />
          <nav className="eyebrow mb-6 flex gap-2 flex-wrap">
            <Link to="/" className="hover:text-lime">{t.home}</Link><span>/</span>
            <Link to="/category/$slug" params={{ slug: category.slug }} className="hover:text-lime">{catName}</Link><span>/</span>
            <span className="text-foreground">{subName}</span>
          </nav>
          <h1 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight">{subName}</h1>
          <p className="text-muted-foreground mt-4 text-sm">{products.length} {locale === "fr" ? "produits" : "منتج"}</p>
        </div>
      </section>
      <section className="max-w-[1600px] mx-auto">
        {products.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="font-display text-2xl font-bold">{t.noProducts}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4 pb-4 md:grid-cols-3 md:gap-4 md:px-6 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </SiteShell>
  );
}