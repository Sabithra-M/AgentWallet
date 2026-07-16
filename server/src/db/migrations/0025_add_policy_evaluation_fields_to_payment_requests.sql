-- The Policy Evaluation Engine (Phase 5) decides AI-Assistant-created payment
-- requests automatically as 'approved' or 'blocked' — no human in the loop —
-- so 'blocked' joins the existing status lifecycle used by the manual
-- create -> approve/reject -> execute flow.
ALTER TABLE payment_requests DROP CONSTRAINT payment_requests_status_check;
ALTER TABLE payment_requests
  ADD CONSTRAINT payment_requests_status_check
  CHECK (status = ANY (ARRAY['pending', 'approved', 'rejected', 'cancelled', 'expired', 'completed', 'blocked']));

-- evaluation_result/block_reason/evaluation_time are populated only for
-- requests the Policy Evaluation Engine actually decided (NULL for the
-- existing manual create -> human approve/reject flow, which never runs
-- through it) — this disambiguates "the engine approved this" from "a human
-- approved this," since both can otherwise leave status = 'approved'.
ALTER TABLE payment_requests ADD COLUMN evaluation_result TEXT CHECK (evaluation_result IN ('approved', 'blocked'));
ALTER TABLE payment_requests ADD COLUMN block_reason TEXT;
ALTER TABLE payment_requests ADD COLUMN evaluation_time TIMESTAMPTZ;
ALTER TABLE payment_requests ADD COLUMN remaining_budget_after NUMERIC(12, 2);
