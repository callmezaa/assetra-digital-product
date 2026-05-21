-- ==========================================
-- 12. STORAGE BUCKETS & RLS POLICIES
-- ==========================================

-- 1. Create Buckets if they don't exist
-- Note: This is usually done via Dashboard, but we can attempt to ensure policies
-- The buckets should be 'thumbnails' and 'assets'

-- 2. Policies for 'thumbnails' (Public read, Authenticated upload)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Thumbnails are public"
ON storage.objects FOR SELECT
USING ( bucket_id = 'thumbnails' );

CREATE POLICY "Users can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'thumbnails' AND
    auth.role() = 'authenticated'
);

-- 3. Policies for 'assets' (Authenticated read, Authenticated upload)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view their own assets"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'assets' AND
    (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "Users can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'assets' AND
    auth.role() = 'authenticated' AND
    (auth.uid()::text = (storage.foldername(name))[1])
);
