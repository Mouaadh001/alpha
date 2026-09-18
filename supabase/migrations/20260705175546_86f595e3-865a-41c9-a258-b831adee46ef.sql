DROP POLICY IF EXISTS "Anyone can read orders for receipt" ON public.orders;
DROP POLICY IF EXISTS "Anyone can read order items for receipt" ON public.order_items;

GRANT EXECUTE ON FUNCTION public.get_order_public(uuid) TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO anon, authenticated, service_role;