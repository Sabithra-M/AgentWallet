-- A simulated single-use virtual card, generated automatically whenever the
-- Policy Evaluation Engine approves an AI-Assistant payment request. Not a
-- real payment credential — card_number/cvv are randomly generated locally,
-- never issued by an actual card network.
CREATE TABLE virtual_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  payment_request_id UUID NOT NULL UNIQUE REFERENCES payment_requests (id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets (id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants (id) ON DELETE RESTRICT,
  card_number TEXT NOT NULL,
  card_holder TEXT NOT NULL,
  cvv TEXT NOT NULL,
  expiry_month SMALLINT NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
  expiry_year SMALLINT NOT NULL,
  spending_limit NUMERIC(12, 2) NOT NULL CHECK (spending_limit > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_virtual_cards_user_id ON virtual_cards (user_id);
CREATE INDEX idx_virtual_cards_wallet_id ON virtual_cards (wallet_id);
CREATE INDEX idx_virtual_cards_status ON virtual_cards (status);

CREATE TRIGGER set_virtual_cards_updated_at
BEFORE UPDATE ON virtual_cards
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
