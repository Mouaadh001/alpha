
-- 1) Remove public SELECT on orders/order_items (PII exposure). Admin ALL policy remains.
DROP POLICY IF EXISTS "Anyone can view an order by id" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;

-- 2) Stop broadcasting order rows via Realtime.
ALTER PUBLICATION supabase_realtime DROP TABLE public.orders;

-- 3) Convert has_role to SECURITY INVOKER so it is no longer a definer function
--    callable by signed-in users. user_roles RLS already lets a user read their
--    own rows, so `has_role(auth.uid(), ...)` continues to work inside policies.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
