-- The AI Risk Engine (Phase 10). `risk_level` already existed from the very
-- first payment_requests migration (intended for exactly this, never
-- actually populated by any code) — reused here rather than duplicated, just
-- extended with a 4th tier. `risk_score` and `risk_factors` are new: the
-- numeric 0-100 score and the rule-by-rule breakdown that produced it, so the
-- Payment Details page can show not just "62" but *why* it's 62.
ALTER TABLE payment_requests DROP CONSTRAINT payment_requests_risk_level_check;
ALTER TABLE payment_requests
  ADD CONSTRAINT payment_requests_risk_level_check
  CHECK (risk_level = ANY (ARRAY['low', 'medium', 'high', 'critical']));

ALTER TABLE payment_requests ADD COLUMN risk_score SMALLINT CHECK (risk_score BETWEEN 0 AND 100);
ALTER TABLE payment_requests ADD COLUMN risk_factors JSONB;

CREATE INDEX idx_payment_requests_risk_level ON payment_requests (risk_level);
