
-- Tighten INSERT policies so they no longer use WITH CHECK (true)
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
CREATE POLICY "Anyone can create an order"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(full_name)) BETWEEN 2 AND 120
  AND length(btrim(phone)) BETWEEN 6 AND 32
  AND length(btrim(wilaya)) BETWEEN 2 AND 80
  AND length(btrim(commune)) BETWEEN 2 AND 120
  AND length(btrim(address)) BETWEEN 2 AND 300
  AND subtotal_da >= 0
  AND total_da >= 0
  AND coalesce(status, 'pending') = 'pending'
);

DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
  order_id IS NOT NULL
  AND length(btrim(product_name)) BETWEEN 1 AND 300
  AND quantity > 0 AND quantity <= 1000
  AND unit_price_da >= 0
  AND line_total_da >= 0
);
