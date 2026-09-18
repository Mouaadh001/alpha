import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

// TODO: replace with the production URL once a custom domain is configured.
const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = ["/", "/cart"];
        let dynamicPaths: string[] = [];
        try {
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false } },
          );
          const [{ data: cats }, { data: subs }, { data: prods }] = await Promise.all([
            supabase.from("categories").select("slug"),
            supabase.from("subcategories").select("slug, categories(slug)"),
            supabase.from("products").select("slug").eq("active", true),
          ]);
          const catPaths = (cats ?? []).map((c) => `/category/${c.slug}`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const subPaths = (subs ?? []).map((s: any) => `/category/${s.categories?.slug}/${s.slug}`).filter((p) => !p.includes("undefined"));
          const prodPaths = (prods ?? []).map((p) => `/product/${p.slug}`);
          dynamicPaths = [...catPaths, ...subPaths, ...prodPaths];
        } catch {
          // Fallback: only static
        }
        const all = [...staticPaths, ...dynamicPaths];
        const urls = all.map((p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>daily</changefreq></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});