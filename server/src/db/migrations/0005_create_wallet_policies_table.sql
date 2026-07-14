CREATE TABLE wallet_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets (id) ON DELETE CASCADE,
  policy_type TEXT NOT NULL CHECK (
    policy_type IN (
      'per_transaction_limit',
      'monthly_limit',
      'merchant_allowlist',
      'merchant_blocklist',
      'category_restriction'
    )
  ),
  threshold_amount NUMERIC(12, 2),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallet_policies_wallet_id ON wallet_policies (wallet_id);
CREATE INDEX idx_wallet_policies_policy_type ON wallet_policies (policy_type);

CREATE TRIGGER set_wallet_policies_updated_at
BEFORE UPDATE ON wallet_policies
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
