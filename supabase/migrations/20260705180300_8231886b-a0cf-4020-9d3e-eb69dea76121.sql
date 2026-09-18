REVOKE EXECUTE ON FUNCTION public.get_order_receipt(uuid) FROM anon, authenticated;
DROP FUNCTION IF EXISTS public.get_order_receipt(uuid);