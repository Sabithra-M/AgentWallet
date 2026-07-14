CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets (id) ON DELETE RESTRICT,
  merchant_id UUID NOT NULL REFERENCES merchants (id) ON DELETE RESTRICT,
  requested_by UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  purpose TEXT,
  ai_confidence NUMERIC(5, 2) CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'cancelled', 'expired')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_requests_wallet_id ON payment_requests (wallet_id);
CREATE INDEX idx_payment_requests_merchant_id ON payment_requests (merchant_id);
CREATE INDEX idx_payment_requests_requested_by ON payment_requests (requested_by);
CREATE INDEX idx_payment_requests_status ON payment_requests (status);
CREATE INDEX idx_payment_requests_created_at ON payment_requests (created_at DESC);

CREATE TRIGGER set_payment_requests_updated_at
BEFORE UPDATE ON payment_requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
