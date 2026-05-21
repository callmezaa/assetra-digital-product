-- ==========================================
-- 7. PAYOUT & REVENUE SETTINGS
-- ==========================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS payout_method TEXT DEFAULT 'none', -- 'stripe', 'paypal', 'bank', 'none'
ADD COLUMN IF NOT EXISTS payout_email TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending'; -- 'verified', 'pending', 'unconfigured'
