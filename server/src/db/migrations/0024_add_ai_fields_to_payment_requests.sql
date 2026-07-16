-- The AI Assistant creates payment requests from natural language, where the
-- merchant's category and the currency are part of what the AI itself
-- determined (not always identical to the merchant record's own category),
-- and "why" the AI created this request is worth keeping for the audit trail.
ALTER TABLE payment_requests ADD COLUMN category TEXT;
ALTER TABLE payment_requests ADD COLUMN currency TEXT NOT NULL DEFAULT 'INR';
ALTER TABLE payment_requests ADD COLUMN ai_reason TEXT;
