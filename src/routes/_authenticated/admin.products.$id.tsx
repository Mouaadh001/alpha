import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/queries";
import { ProductEditor } from "@/components/admin/product-editor";

const productByIdQO = (id: string) =>
  queryOptions({
    queryKey: ["admin", "product", id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery(productByIdQO(id));
  if (isLoading) return <div className="text-sm text-muted-foreground">Chargement…</div>;
  if (!data) return <div className="text-sm text-muted-foreground">Produit introuvable.</div>;
  return <ProductEditor product={data} />;
}