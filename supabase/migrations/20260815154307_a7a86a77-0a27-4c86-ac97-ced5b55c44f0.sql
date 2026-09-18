CREATE TABLE public.site_status (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  maintenance boolean NOT NULL DEFAULT false,
  message_fr text NOT NULL DEFAULT 'Notre boutique est temporairement en maintenance. Nous revenons très vite.',
  message_ar text NOT NULL DEFAULT 'المتجر في صيانة مؤقتة. سنعود قريباً.',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_status TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_status TO authenticated;
GRANT ALL ON public.site_status TO service_role;
ALTER TABLE public.site_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_status_public_read" ON public.site_status FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_status_admin_update" ON public.site_status FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_status_admin_insert" ON public.site_status FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.site_status (id, maintenance) VALUES (true, false);