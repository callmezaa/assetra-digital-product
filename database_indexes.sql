-- ==========================================
-- DATABASE PERFORMANCE INDEXES
-- Run this in Supabase SQL Editor
-- ==========================================
-- These indexes speed up the most common
-- queries across the Assetra marketplace.
-- ==========================================

-- 1. PRODUCTS TABLE
-- Filter by category (Marketplace filtering)
CREATE INDEX IF NOT EXISTS idx_products_category 
  ON products(category);

-- Filter by seller (Creator storefront / profile page)
CREATE INDEX IF NOT EXISTS idx_products_user_id 
  ON products(user_id);

-- Filter published products (Marketplace always filters by status)
CREATE INDEX IF NOT EXISTS idx_products_status 
  ON products(status);

-- Compound: published products sorted by newest (most common marketplace query)
CREATE INDEX IF NOT EXISTS idx_products_status_created 
  ON products(status, created_at DESC);

-- Compound: seller's published products (profile page query)
CREATE INDEX IF NOT EXISTS idx_products_user_status 
  ON products(user_id, status);

-- Full-text search on title (search bar)
CREATE INDEX IF NOT EXISTS idx_products_title_search
  ON products USING gin(to_tsvector('english', title));


-- 2. ORDERS TABLE
-- Find orders by buyer (Library page, download auth)
CREATE INDEX IF NOT EXISTS idx_orders_user_id 
  ON orders(user_id);

-- Find orders by product (sales count, purchase check)
CREATE INDEX IF NOT EXISTS idx_orders_product_id 
  ON orders(product_id);

-- Compound: check if specific user bought specific product (download auth - hot path)
CREATE INDEX IF NOT EXISTS idx_orders_user_product_status 
  ON orders(user_id, product_id, status);


-- 3. CHAT TABLES
-- Get messages for a specific room (ChatWindow real-time query)
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id 
  ON chat_messages(room_id);

-- Get messages sorted by time (message list ordering)
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created 
  ON chat_messages(room_id, created_at ASC);

-- Get chat rooms for a user (ChatList query)
CREATE INDEX IF NOT EXISTS idx_chat_rooms_participant_a 
  ON chat_rooms(participant_a);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_participant_b 
  ON chat_rooms(participant_b);


-- 4. FOLLOWS TABLE
-- Check if user A follows user B (My Feed filter)
CREATE INDEX IF NOT EXISTS idx_follows_follower 
  ON follows(follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_following 
  ON follows(following_id);

-- Compound: fast follow-check lookup (follow button status)
CREATE INDEX IF NOT EXISTS idx_follows_pair 
  ON follows(follower_id, following_id);


-- 5. NOTIFICATIONS TABLE
-- Get notifications for a user (NotificationBell)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
  ON notifications(user_id);

-- Get unread notifications count efficiently
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, is_read) WHERE is_read = false;


-- 6. REVIEWS TABLE
-- Get reviews for a product (ReviewSection)
CREATE INDEX IF NOT EXISTS idx_reviews_product_id 
  ON reviews(product_id);

-- Check if user has reviewed (upsert guard)
CREATE INDEX IF NOT EXISTS idx_reviews_user_product 
  ON reviews(user_id, product_id);


-- ==========================================
-- ANALYZE: Update query planner statistics
-- Run after creating indexes
-- ==========================================
ANALYZE products;
ANALYZE orders;
ANALYZE notifications;
ANALYZE follows;
