ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS family_key text;

CREATE INDEX IF NOT EXISTS products_family_key_idx ON public.products (family_key);