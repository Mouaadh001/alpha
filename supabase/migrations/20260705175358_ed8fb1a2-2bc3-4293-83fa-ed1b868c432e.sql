GRANT SELECT, INSERT ON public.orders TO anon;
GRANT SELECT, INSERT ON public.order_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;

DROP POLICY IF EXISTS "Anyone can read orders for receipt" ON public.orders;
CREATE POLICY "Anyone can read orders for receipt"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can read order items for receipt" ON public.order_items;
CREATE POLICY "Anyone can read order items for receipt"
ON public.order_items
FOR SELECT
TO anon, authenticated
USING (true);