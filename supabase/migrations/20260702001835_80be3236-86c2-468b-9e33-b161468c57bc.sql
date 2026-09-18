DELETE FROM public.order_items WHERE product_id IN (SELECT id FROM public.products WHERE category_id IN (SELECT id FROM public.categories WHERE slug IN ('accessoires','consoles-retro')));
DELETE FROM public.products WHERE category_id IN (SELECT id FROM public.categories WHERE slug IN ('accessoires','consoles-retro'));
DELETE FROM public.subcategories WHERE category_id IN (SELECT id FROM public.categories WHERE slug IN ('accessoires','consoles-retro'));
DELETE FROM public.categories WHERE slug IN ('accessoires','consoles-retro');