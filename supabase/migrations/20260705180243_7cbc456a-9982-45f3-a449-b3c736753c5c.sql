CREATE OR REPLACE FUNCTION public.get_order_receipt(order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order jsonb;
  v_items jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'full_name', o.full_name,
    'phone', o.phone,
    'wilaya', o.wilaya,
    'commune', o.commune,
    'address', o.address,
    'notes', o.notes,
    'subtotal_da', o.subtotal_da,
    'total_da', o.total_da,
    'status', o.status,
    'created_at', o.created_at
  ) INTO v_order
  FROM public.orders o
  WHERE o.id = order_id;

  IF v_order IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', i.id,
    'order_id', i.order_id,
    'product_id', i.product_id,
    'product_name', i.product_name,
    'product_slug', i.product_slug,
    'image_url', i.image_url,
    'unit_price_da', i.unit_price_da,
    'quantity', i.quantity,
    'line_total_da', i.line_total_da
  ) ORDER BY i.id), '[]'::jsonb)
  INTO v_items
  FROM public.order_items i
  WHERE i.order_id = order_id;

  RETURN jsonb_build_object('order', v_order, 'items', v_items);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_order_receipt(uuid) TO anon, authenticated;