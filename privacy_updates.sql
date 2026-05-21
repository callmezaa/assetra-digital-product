-- ==========================================
-- 8. PRIVACY & VISIBILITY CONTROLS
-- ==========================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS hide_sales BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_private_profile BOOLEAN DEFAULT FALSE, -- for SEO (noindex)
ADD COLUMN IF NOT EXISTS show_verified_badge BOOLEAN DEFAULT TRUE;
