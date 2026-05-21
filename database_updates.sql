-- ==========================================
-- 4. REVIEWS & RATINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, product_id) -- One review per user per product
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Reviews are viewable by everyone." 
  ON reviews FOR SELECT USING (true);

-- Only users who have a completed order for the product can insert a review
CREATE POLICY "Users can insert review if they purchased." 
  ON reviews FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.user_id = auth.uid() 
      AND orders.product_id = reviews.product_id 
      AND orders.status = 'completed'
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update their own review." 
  ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- 5. FOLLOW SYSTEM TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Everyone can view follows (to count followers)
CREATE POLICY "Follows are viewable by everyone." 
  ON follows FOR SELECT USING (true);

-- Users can only follow/unfollow for themselves
CREATE POLICY "Users can manage their own follows." 
  ON follows FOR ALL USING (auth.uid() = follower_id);
