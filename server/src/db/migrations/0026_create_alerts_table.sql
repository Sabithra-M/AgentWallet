-- Realtime security alerts, created automatically whenever the Policy
-- Evaluation Engine finishes deciding an AI-Assistant payment request.
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  payment_request_id UUID REFERENCES payment_requests (id) ON DELETE SET NULL,
  wallet_id UUID REFERENCES wallets (id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (
    type IN (
      'payment_approved',
      'payment_blocked',
      'budget_exceeded',
      'max_transaction_exceeded',
      'daily_limit_exceeded',
      'monthly_limit_exceeded',
      'merchant_not_allowed',
      'blocked_category',
      'pin_required',
      'wallet_expired',
      'wallet_disabled',
      'policy_disabled',
      'insufficient_wallet_balance'
    )
  ),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_user_id ON alerts (user_id);
CREATE INDEX idx_alerts_created_at ON alerts (created_at DESC);
CREATE INDEX idx_alerts_payment_request_id ON alerts (payment_request_id);
