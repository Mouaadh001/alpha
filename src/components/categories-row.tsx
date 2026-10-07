import type { Category } from "@/lib/queries";
import { CategoryTile } from "./category-tile";

export function CategoriesRow({ categories }: { categories: Category[] }) {
  return (
    <div
      className="grid grid-cols-2 gap-5
                 sm:grid-cols-3 sm:gap-6
                 md:grid-cols-3 md:gap-8
                 lg:grid-cols-5 lg:gap-10"
    >
      {categories.map((c, i) => (
        <CategoryTile key={c.id} category={c} index={i} />
      ))}
    </div>
  );
}