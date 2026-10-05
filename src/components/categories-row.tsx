import type { Category } from "@/lib/queries";
import { CategoryTile } from "./category-tile";

export function CategoriesRow({ categories }: { categories: Category[] }) {
  return (
    <div
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 no-scrollbar
                 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-5"
    >
      {categories.map((c, i) => (
        <div
          key={c.id}
          className="w-[58vw] max-w-[260px] shrink-0 snap-start md:w-auto md:max-w-none"
        >
          <CategoryTile category={c} index={i} />
        </div>
      ))}
    </div>
  );
}