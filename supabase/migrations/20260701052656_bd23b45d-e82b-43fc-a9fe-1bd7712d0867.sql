
-- Extend products with commerce fields
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS barcode text,
  ADD COLUMN IF NOT EXISTS short_description_fr text,
  ADD COLUMN IF NOT EXISTS short_description_ar text,
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS is_new boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_bestseller boolean NOT NULL DEFAULT false;

-- Extend categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS description_fr text,
  ADD COLUMN IF NOT EXISTS description_ar text,
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;

-- Extend subcategories
ALTER TABLE public.subcategories
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS description_fr text,
  ADD COLUMN IF NOT EXISTS description_ar text,
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;

-- Homepage builder (CMS)
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.homepage_sections TO anon, authenticated;
GRANT ALL ON public.homepage_sections TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.homepage_sections TO authenticated;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "homepage public read" ON public.homepage_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "homepage admin write" ON public.homepage_sections FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER homepage_sections_updated_at BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.tg_products_updated_at();

-- Seed default sections if empty
INSERT INTO public.homepage_sections (section_type, position, config)
SELECT * FROM (VALUES
  ('hero', 0, '{"slides":[]}'::jsonb),
  ('value_strip', 1, '{}'::jsonb),
  ('featured_categories', 2, '{"title_fr":"Explorer par univers","title_ar":"استكشف حسب الكون"}'::jsonb),
  ('featured_products', 3, '{"title_fr":"Sélection Alpha","title_ar":"اختيار ألفا","limit":10}'::jsonb),
  ('category_strips', 4, '{}'::jsonb),
  ('promo_banner', 5, '{"title_fr":"Livraison partout en Algérie","subtitle_fr":"58 wilayas · Retour 14 jours"}'::jsonb),
  ('newsletter', 6, '{}'::jsonb)
) AS v(section_type, position, config)
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_sections);
