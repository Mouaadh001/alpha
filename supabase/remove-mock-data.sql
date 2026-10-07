-- Remove mock products first (to avoid foreign key constraint errors)
DELETE FROM public.products 
WHERE category_id IN (
  '11111111-1111-1111-1111-111111111111', 
  '22222222-2222-2222-2222-222222222222'
);

-- Remove the mock categories
DELETE FROM public.categories 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111', 
  '22222222-2222-2222-2222-222222222222'
);
