-- ==========================================
-- 11. REAL-TIME CHAT SYSTEM
-- ==========================================

-- Chat Rooms: Groups two participants
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_a UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_b UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Ensure uniqueness between participants (a,b) regardless of order
    UNIQUE(participant_a, participant_b)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Chat Rooms
CREATE POLICY "Users can view rooms they are part of" 
ON chat_rooms FOR SELECT 
USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can create rooms they are part of" 
ON chat_rooms FOR INSERT 
WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

-- Policies for Chat Messages
CREATE POLICY "Users can view messages in their rooms" 
ON chat_messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM chat_rooms 
        WHERE id = chat_messages.room_id 
        AND (participant_a = auth.uid() OR participant_b = auth.uid())
    )
);

CREATE POLICY "Users can send messages to their rooms" 
ON chat_messages FOR INSERT 
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM chat_rooms 
        WHERE id = chat_messages.room_id 
        AND (participant_a = auth.uid() OR participant_b = auth.uid())
    )
);

-- Function to update last_message in chat_room on new message
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_rooms
    SET last_message = NEW.content,
        last_message_at = NEW.created_at
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_room
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_room_last_message();
