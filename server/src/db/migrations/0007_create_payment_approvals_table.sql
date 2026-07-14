CREATE TABLE payment_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id UUID NOT NULL REFERENCES payment_requests (id) ON DELETE CASCADE,
  decided_by UUID REFERENCES users (id) ON DELETE SET NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  reason TEXT,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_approvals_payment_request_id ON payment_approvals (payment_request_id);
CREATE INDEX idx_payment_approvals_decided_by ON payment_approvals (decided_by);
CREATE INDEX idx_payment_approvals_decided_at ON payment_approvals (decided_at DESC);

CREATE TRIGGER set_payment_approvals_updated_at
BEFORE UPDATE ON payment_approvals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
