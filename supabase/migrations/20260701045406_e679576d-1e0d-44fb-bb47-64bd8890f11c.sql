
create policy "product-images public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');
create policy "product-images admin write" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "product-images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "product-images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
