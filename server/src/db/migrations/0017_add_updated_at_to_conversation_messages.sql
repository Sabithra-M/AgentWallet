-- NULL means never edited; set explicitly by the message-edit endpoint.
ALTER TABLE conversation_messages
  ADD COLUMN updated_at TIMESTAMPTZ;
