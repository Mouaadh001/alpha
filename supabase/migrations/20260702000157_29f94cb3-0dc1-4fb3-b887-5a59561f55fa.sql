-- category-images bucket policies
DROP POLICY IF EXISTS "cat-images auth read" ON storage.objects;
CREATE POLICY "cat-images auth read"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

DROP POLICY IF EXISTS "cat-images admin insert" ON storage.objects;
CREATE POLICY "cat-images admin insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'category-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "cat-images admin update" ON storage.objects;
CREATE POLICY "cat-images admin update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'category-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "cat-images admin delete" ON storage.objects;
CREATE POLICY "cat-images admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'category-images' AND public.has_role(auth.uid(), 'admin'));

-- Enable realtime for orders
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;