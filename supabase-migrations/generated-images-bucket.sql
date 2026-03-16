-- Create public storage bucket for AI-generated images (Monty)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-images',
  'generated-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access
CREATE POLICY IF NOT EXISTS "Public read generated-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated-images');

-- Allow service role to upload
CREATE POLICY IF NOT EXISTS "Service role upload generated-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'generated-images');

-- Allow service role to delete old images
CREATE POLICY IF NOT EXISTS "Service role delete generated-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'generated-images');
