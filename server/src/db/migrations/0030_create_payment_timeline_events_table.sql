-- An append-only event log for every payment request's lifecycle (created,
-- evaluation started, approved/blocked, card generated/used, completed).
-- Uses clock_timestamp() rather than the default now() specifically because
-- every insert in this app happens inside one transaction per request, and
-- now() is frozen for the whole transaction — clock_timestamp() actually
-- advances between each step, giving genuinely ordered, distinct timestamps.
CREATE TABLE payment_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id UUID NOT NULL REFERENCES payment_requests (id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'created', 'evaluation_started', 'approved', 'blocked',
      'card_generated', 'card_used', 'payment_completed'
    )
  ),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_payment_timeline_events_payment_request_id ON payment_timeline_events (payment_request_id);
