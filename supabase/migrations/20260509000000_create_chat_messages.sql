-- Create chat_messages table for live event chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES live_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL CHECK (length(message) > 0 AND length(message) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index for fast queries
  INDEX idx_chat_messages_event_id ON chat_messages(event_id),
  INDEX idx_chat_messages_created_at ON chat_messages(created_at)
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can read messages for an event
CREATE POLICY "Anyone can view chat messages"
  ON chat_messages
  FOR SELECT
  USING (true);

-- Only authenticated users can send messages
CREATE POLICY "Authenticated users can send messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Create index for event chat queries (newest first)
CREATE INDEX IF NOT EXISTS idx_chat_messages_event_created
  ON chat_messages(event_id, created_at DESC);

-- Comment
COMMENT ON TABLE chat_messages IS 'Real-time chat messages for live events';
