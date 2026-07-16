ALTER TABLE users
  ADD COLUMN theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  ADD COLUMN notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN email_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN push_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN dark_mode_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN default_wallet_id UUID REFERENCES wallets (id) ON DELETE SET NULL,
  ADD COLUMN monthly_spending_limit NUMERIC(12, 2),
  ADD COLUMN preferred_currency TEXT NOT NULL DEFAULT 'INR';
