-- The Policy Engine: exactly one policy row per AI Wallet. UNIQUE + CASCADE
-- gives us "one policy per wallet" and "delete wallet -> delete its policy"
-- at the database level, not just in application code.
CREATE TABLE ai_wallet_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL UNIQUE REFERENCES wallets (id) ON DELETE CASCADE,
  max_wallet_budget NUMERIC(12, 2) NOT NULL CHECK (max_wallet_budget > 0),
  max_per_transaction NUMERIC(12, 2) NOT NULL CHECK (
    max_per_transaction > 0 AND max_per_transaction <= max_wallet_budget
  ),
  allowed_merchant_ids UUID[] NOT NULL DEFAULT '{}',
  blocked_categories TEXT[] NOT NULL DEFAULT '{}',
  allowed_countries TEXT[],
  daily_transaction_limit NUMERIC(12, 2) NOT NULL CHECK (
    daily_transaction_limit > 0 AND daily_transaction_limit <= max_wallet_budget
  ),
  monthly_transaction_limit NUMERIC(12, 2) NOT NULL CHECK (
    monthly_transaction_limit > 0 AND monthly_transaction_limit <= max_wallet_budget
  ),
  pin_required_above NUMERIC(12, 2) NOT NULL CHECK (pin_required_above > 0),
  auto_expire_with_wallet BOOLEAN NOT NULL DEFAULT true,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_wallet_policies_wallet_id ON ai_wallet_policies (wallet_id);

CREATE TRIGGER set_ai_wallet_policies_updated_at
BEFORE UPDATE ON ai_wallet_policies
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
