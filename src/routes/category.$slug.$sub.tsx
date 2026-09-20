import { createFileRoute, redirect } from "@tanstack/react-router";
import { categoriesQO } from "@/lib/queries";

// Subcategories are removed — redirect any old sub-category URL to the parent category
export const Route = createFileRoute("/category/$slug/$sub")({
  loader: async ({ params }) => {
    throw redirect({ to: "/category/$slug", params: { slug: params.slug } });
  },
  component: () => null,
});