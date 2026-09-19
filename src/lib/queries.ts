import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string | null;
  position: number;
  image_url: string | null;
};

export type Subcategory = {
  id: string;
  category_id: string;
  slug: string;
  name_fr: string;
  name_ar: string | null;
  position: number;
};

export type Product = {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string | null;
  description_fr: string | null;
  description_ar: string | null;
  price_da: number;
  compare_at_price_da: number | null;
  brand: string | null;
  image_url: string | null;
  images: string[];
  stock: number;
  featured: boolean;
  active: boolean;
  category_id: string;
  subcategory_id: string | null;
  created_at: string;
  sku?: string | null;
  barcode?: string | null;
  short_description_fr?: string | null;
  short_description_ar?: string | null;
  cover_image?: string | null;
  video_url?: string | null;
  is_new?: boolean;
  is_bestseller?: boolean;
  storage_option_1?: string | null;
  storage_option_2?: string | null;
  price_da_option_2?: number | null;
  family_key?: string | null;
};

export const categoriesQO = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase.from("categories").select("*").order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const subcategoriesQO = queryOptions({
  queryKey: ["subcategories"],
  queryFn: async (): Promise<Subcategory[]> => {
    const { data, error } = await supabase.from("subcategories").select("*").order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const featuredProductsQO = queryOptions({
  queryKey: ["products", "featured"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw error;
    return data ?? [];
  },
});

export const latestProductsQO = queryOptions({
  queryKey: ["products", "latest"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(12);
    if (error) throw error;
    return data ?? [];
  },
});

export const productsByCategoryQO = (categoryId: string) => queryOptions({
  queryKey: ["products", "byCategory", categoryId],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const productsBySubcategoryQO = (subcategoryId: string) => queryOptions({
  queryKey: ["products", "bySub", subcategoryId],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("subcategory_id", subcategoryId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const productBySlugQO = (slug: string) => queryOptions({
  queryKey: ["product", slug],
  queryFn: async (): Promise<Product | null> => {
    const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const productFamilyQO = (familyKey: string) => queryOptions({
  queryKey: ["products", "family", familyKey],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("family_key", familyKey)
      .order("price_da", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const productByFamilyFirstQO = (familyKey: string) => queryOptions({
  queryKey: ["products", "familyFirst", familyKey],
  queryFn: async (): Promise<Product | null> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("family_key", familyKey)
      .order("price_da", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const allProductsAdminQO = queryOptions({
  queryKey: ["admin", "products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const isAdminQO = queryOptions({
  queryKey: ["me", "isAdmin"],
  queryFn: async (): Promise<boolean> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return false;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.session.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (error) return false;
    return !!data;
  },
  staleTime: 60_000,
});

export type AnnouncementBar = {
  enabled: boolean;
  text_fr: string;
  text_ar: string;
  speed_seconds: number;
  bg_color: string;
  text_color: string;
};

export const announcementBarQO = queryOptions({
  queryKey: ["announcement_bar"],
  queryFn: async (): Promise<AnnouncementBar | null> => {
    const { data, error } = await supabase
      .from("announcement_bar")
      .select("enabled, text_fr, text_ar, speed_seconds, bg_color, text_color")
      .eq("id", true)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  staleTime: 30_000,
});

export const productsByCategoryPreviewQO = (categoryId: string) => queryOptions({
  queryKey: ["products", "byCategoryPreview", categoryId],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false })
      .limit(4);
    if (error) throw error;
    return data ?? [];
  },
});

// ────────── Admin: orders ──────────
export type AdminOrder = {
  id: string;
  order_number: string;
  full_name: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  notes: string | null;
  subtotal_da: number;
  total_da: number;
  status: string;
  created_at: string;
};

export const allOrdersAdminQO = queryOptions({
  queryKey: ["admin", "orders"],
  queryFn: async (): Promise<AdminOrder[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as AdminOrder[];
  },
});

// ────────── CMS: homepage sections ──────────
export type HomepageSection = {
  id: string;
  section_type: string;
  position: number;
  enabled: boolean;
  config: Record<string, unknown>;
};

export const homepageSectionsQO = queryOptions({
  queryKey: ["homepage_sections"],
  queryFn: async (): Promise<HomepageSection[]> => {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("id, section_type, position, enabled, config")
      .order("position");
    if (error) throw error;
    return (data ?? []) as HomepageSection[];
  },
  staleTime: 60_000,
});
// ────────── Site status (maintenance mode) ──────────
export type SiteStatus = {
  maintenance: boolean;
  message_fr: string;
  message_ar: string;
};

export const siteStatusQO = queryOptions({
  queryKey: ["site_status"],
  queryFn: async (): Promise<SiteStatus | null> => {
    const { data, error } = await supabase
      .from("site_status")
      .select("maintenance, message_fr, message_ar")
      .eq("id", true)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  staleTime: 15_000,
});
