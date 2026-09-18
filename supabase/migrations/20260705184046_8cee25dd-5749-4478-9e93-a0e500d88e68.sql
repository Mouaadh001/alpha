ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS storage_option_1 text,
  ADD COLUMN IF NOT EXISTS storage_option_2 text,
  ADD COLUMN IF NOT EXISTS price_da_option_2 integer;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant text;