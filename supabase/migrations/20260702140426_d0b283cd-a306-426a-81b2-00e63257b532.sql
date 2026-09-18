
-- Restrict authenticated product reads to active products (admins keep full access via existing admin policy)
DROP POLICY IF EXISTS "products auth read all" ON public.products;
CREATE POLICY "products auth read active" ON public.products
  FOR SELECT TO authenticated
  USING (active = true OR public.has_role(auth.uid(), 'admin'::app_role));

-- Revoke public execute on SECURITY DEFINER functions; access happens via triggers or service_role
REVOKE EXECUTE ON FUNCTION public.get_order_public(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM anon, authenticated, PUBLIC;
