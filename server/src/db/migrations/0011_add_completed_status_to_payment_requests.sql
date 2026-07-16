-- Payment execution introduces a distinct "completed" state, separate from
-- "approved" (decision made) — see paymentRequests.service.js's executePayment.
ALTER TABLE payment_requests DROP CONSTRAINT payment_requests_status_check;
ALTER TABLE payment_requests ADD CONSTRAINT payment_requests_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'expired', 'completed'));
