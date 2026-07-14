CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id UUID REFERENCES payment_requests (id) ON DELETE SET NULL,
  wallet_id UUID NOT NULL REFERENCES wallets (id) ON DELETE RESTRICT,
  merchant_id UUID REFERENCES merchants (id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method TEXT,
  transacted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_transactions_payment_request_id ON payment_transactions (payment_request_id);
CREATE INDEX idx_payment_transactions_wallet_id ON payment_transactions (wallet_id);
CREATE INDEX idx_payment_transactions_merchant_id ON payment_transactions (merchant_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions (status);
CREATE INDEX idx_payment_transactions_transacted_at ON payment_transactions (transacted_at DESC);

CREATE TRIGGER set_payment_transactions_updated_at
BEFORE UPDATE ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
