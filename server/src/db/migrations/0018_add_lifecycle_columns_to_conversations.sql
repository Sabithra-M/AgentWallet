ALTER TABLE conversations
  ADD COLUMN archived_at TIMESTAMPTZ,
  ADD COLUMN deleted_at TIMESTAMPTZ,
  ADD COLUMN last_message_at TIMESTAMPTZ;

-- Backfill for conversations created before this column existed.
UPDATE conversations c
SET last_message_at = (
  SELECT MAX(m.created_at) FROM conversation_messages m WHERE m.conversation_id = c.id
);

CREATE INDEX idx_conversations_deleted_at ON conversations (deleted_at);
CREATE INDEX idx_conversations_archived_at ON conversations (archived_at);
CREATE INDEX idx_conversations_last_message_at ON conversations (last_message_at DESC);
