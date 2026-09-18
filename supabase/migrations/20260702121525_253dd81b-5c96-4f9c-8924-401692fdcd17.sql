
CREATE OR REPLACE FUNCTION public.get_order_public(order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order jsonb;
  v_items jsonb;
BEGIN
  SELECT to_jsonb(o) INTO v_order FROM public.orders o WHERE o.id = order_id;
  IF v_order IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT COALESCE(jsonb_agg(to_jsonb(i) ORDER BY i.id), '[]'::jsonb)
    INTO v_items FROM public.order_items i WHERE i.order_id = order_id;
  RETURN jsonb_build_object('order', v_order, 'items', v_items);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_public(uuid) TO anon, authenticated;
