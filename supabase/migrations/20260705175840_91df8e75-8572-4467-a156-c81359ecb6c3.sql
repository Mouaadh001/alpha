GRANT INSERT ON TABLE public.orders TO anon;
GRANT INSERT ON TABLE public.order_items TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE public.orders TO authenticated;
GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE public.order_items TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.orders TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.order_items TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO anon, authenticated, service_role;