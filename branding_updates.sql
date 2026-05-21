-- ==========================================
-- 6. PROFILE BRANDING UPGRADES
-- ==========================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#4F46E5'; -- Default to Assetra primary
