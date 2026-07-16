-- The manual approve/reject flow (decidePayment) uses 'rejected', distinct
-- from the automatic Policy Engine's 'blocked' — both get their own timeline
-- event type rather than conflating a human's decision with the engine's.
ALTER TABLE payment_timeline_events DROP CONSTRAINT payment_timeline_events_event_type_check;
ALTER TABLE payment_timeline_events
  ADD CONSTRAINT payment_timeline_events_event_type_check
  CHECK (
    event_type IN (
      'created', 'evaluation_started', 'approved', 'rejected', 'blocked',
      'card_generated', 'card_used', 'payment_completed'
    )
  );
