-- ==========================================
-- SECURE DOWNLOAD: STORAGE POLICY UPDATE
-- Run this in Supabase SQL Editor
-- ==========================================

-- The 'assets' bucket must be PRIVATE (public = false)
-- This ensures no one can access files via public URL
UPDATE storage.buckets 
SET public = false 
WHERE id = 'assets';

-- Drop the old restrictive SELECT policy that only allowed uploaders
DROP POLICY IF EXISTS "Users can view their own assets" ON storage.objects;

-- The admin client (service_role key) bypasses ALL RLS policies on storage.
-- So we do NOT need a SELECT policy for buyers — the API route handles
-- authorization checks in application code, then uses the admin client
-- to generate the signed URL.

-- However, creators still need to be able to UPLOAD their own files:
DROP POLICY IF EXISTS "Users can upload assets" ON storage.objects;

CREATE POLICY "Authenticated users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'assets' AND
    (auth.uid()::text = (storage.foldername(name))[1])
);

-- Allow creators to DELETE their own files (e.g., when editing a product)
DROP POLICY IF EXISTS "Users can delete their own assets" ON storage.objects;

CREATE POLICY "Creators can delete their own assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'assets' AND
    (auth.uid()::text = (storage.foldername(name))[1])
);

-- Allow creators to UPDATE (replace) their own files
DROP POLICY IF EXISTS "Users can update their own assets" ON storage.objects;

CREATE POLICY "Creators can update their own assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'assets' AND
    (auth.uid()::text = (storage.foldername(name))[1])
);

-- Note: There is intentionally NO public SELECT policy on the assets bucket.
-- All downloads go through /api/download/[productId] which:
--   1. Verifies the user is authenticated
--   2. Verifies the user is the product owner OR has a completed order
--   3. Uses the service_role admin client to generate a 15-minute signed URL
--   4. Redirects the browser to the signed URL for download
