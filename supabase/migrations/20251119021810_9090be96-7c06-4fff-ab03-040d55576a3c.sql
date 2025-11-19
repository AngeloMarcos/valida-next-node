-- Criar bucket de storage para anexos de propostas
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposta-anexos', 'proposta-anexos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies para o bucket
CREATE POLICY "Users can view anexos from their empresa"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'proposta-anexos' AND
  (storage.foldername(name))[1] IN (
    SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can upload anexos in their empresa"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proposta-anexos' AND
  (storage.foldername(name))[1] IN (
    SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete anexos in their empresa"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'proposta-anexos' AND
  (storage.foldername(name))[1] IN (
    SELECT empresa_id::text FROM public.profiles WHERE id = auth.uid()
  )
);