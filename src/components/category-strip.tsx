import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoriesQO } from "@/lib/queries";
import { useI18n, useT } from "@/lib/i18n";

export function CategoryStrip() {
  const { data: categories = [] } = useQuery(categoriesQO);
  const { locale } = useI18n();
  const t = useT();
  return (
    <section className="border-y border-hairline bg-surface overflow-x-auto no-scrollbar">
      <div className="flex min-w-max divide-x divide-hairline">
        <div className="px-6 py-5 flex items-center">
          <span className="eyebrow">{t.browseUniverse}</span>
        </div>
        {categories.map((c, i) => {
          const name = locale === "ar" && c.name_ar ? c.name_ar : c.name_fr;
          return (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="px-6 py-5 flex items-center gap-3 hover:bg-lime/5 transition-colors group"
            >
              <span className="text-[10px] font-mono text-muted-foreground group-hover:text-lime">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-xs uppercase tracking-widest font-bold">{name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}