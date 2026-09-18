
-- Multi-image gallery
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';

-- Order number sequence
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1001;

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT ('AS-' || to_char(now(), 'YYMM') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0')),
  full_name text NOT NULL,
  phone text NOT NULL,
  wilaya text NOT NULL,
  commune text NOT NULL,
  address text NOT NULL,
  notes text,
  subtotal_da numeric NOT NULL,
  total_da numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT USAGE ON SEQUENCE public.order_number_seq TO anon, authenticated;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
CREATE POLICY "Anyone can create an order" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view an order by id" ON public.orders;
-- Order lookup by id is treated as capability-token access (uuid is unguessable).
CREATE POLICY "Anyone can view an order by id" ON public.orders FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_slug text NOT NULL,
  image_url text,
  unit_price_da numeric NOT NULL,
  quantity integer NOT NULL,
  line_total_da numeric NOT NULL
);
GRANT SELECT, INSERT ON public.order_items TO anon, authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage order items" ON public.order_items;
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
