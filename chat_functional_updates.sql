-- Add product context to chat rooms
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Add attachment and message type to chat messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text';
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_product ON chat_rooms(product_id);
