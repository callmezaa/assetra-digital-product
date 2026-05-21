-- ==========================================
-- 9. EMAIL NOTIFICATION PREFERENCES
-- ==========================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_on_sale BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_weekly_summary BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_on_follower BOOLEAN DEFAULT TRUE;
