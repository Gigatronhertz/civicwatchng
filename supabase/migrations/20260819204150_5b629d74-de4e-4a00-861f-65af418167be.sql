
CREATE POLICY "anyone can upload evidence" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'evidence');
CREATE POLICY "staff read evidence" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'evidence' AND public.is_staff(auth.uid()));
