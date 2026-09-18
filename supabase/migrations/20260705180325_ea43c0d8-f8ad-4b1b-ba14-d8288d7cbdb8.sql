CREATE POLICY "Anyone can read orders by receipt link"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can read order items by receipt link"
ON public.order_items
FOR SELECT
TO anon, authenticated
USING (true);