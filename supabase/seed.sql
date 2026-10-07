-- Insert Mock Categories
INSERT INTO public.categories (id, slug, name_fr, name_ar, position, image_url)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'consoles', 'Consoles', 'أجهزة', 1, NULL),
  ('22222222-2222-2222-2222-222222222222', 'accessoires', 'Accessoires', 'إكسسوارات', 2, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert Mock Products for Consoles
INSERT INTO public.products (id, slug, name_fr, price_da, category_id, stock, active)
VALUES 
  ('33333333-3333-3333-3333-333333333301', 'playstation-5', 'PlayStation 5 Édition Standard', 125000, '11111111-1111-1111-1111-111111111111', 10, true),
  ('33333333-3333-3333-3333-333333333302', 'xbox-series-x', 'Xbox Series X 1To', 120000, '11111111-1111-1111-1111-111111111111', 5, true),
  ('33333333-3333-3333-3333-333333333303', 'nintendo-switch-oled', 'Nintendo Switch OLED', 65000, '11111111-1111-1111-1111-111111111111', 15, true),
  ('33333333-3333-3333-3333-333333333304', 'playstation-4-pro', 'PlayStation 4 Pro 1To', 75000, '11111111-1111-1111-1111-111111111111', 8, true),
  ('33333333-3333-3333-3333-333333333305', 'xbox-series-s', 'Xbox Series S 512Go', 55000, '11111111-1111-1111-1111-111111111111', 12, true)
ON CONFLICT (id) DO NOTHING;

-- Insert Mock Products for Accessoires
INSERT INTO public.products (id, slug, name_fr, price_da, category_id, stock, active)
VALUES 
  ('44444444-4444-4444-4444-444444444401', 'manette-ps5-dualsense', 'Manette sans fil DualSense PS5', 14500, '22222222-2222-2222-2222-222222222222', 20, true),
  ('44444444-4444-4444-4444-444444444402', 'casque-logitech-g-pro', 'Casque Gaming Logitech G PRO X', 22000, '22222222-2222-2222-2222-222222222222', 7, true),
  ('44444444-4444-4444-4444-444444444403', 'manette-xbox-elite-2', 'Manette Xbox Elite Series 2', 28000, '22222222-2222-2222-2222-222222222222', 4, true),
  ('44444444-4444-4444-4444-444444444404', 'volant-logitech-g29', 'Volant de course Logitech G29', 55000, '22222222-2222-2222-2222-222222222222', 3, true),
  ('44444444-4444-4444-4444-444444444405', 'carte-memoire-switch-128gb', 'Carte MicroSDXC SanDisk 128Go', 4500, '22222222-2222-2222-2222-222222222222', 30, true)
ON CONFLICT (id) DO NOTHING;
