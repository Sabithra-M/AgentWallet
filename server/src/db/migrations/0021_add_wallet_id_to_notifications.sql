-- NULL for notifications not tied to a specific wallet (none exist today, but
-- keeps this from being a breaking change for any future non-wallet alert).
ALTER TABLE notifications ADD COLUMN wallet_id UUID REFERENCES wallets (id) ON DELETE SET NULL;

CREATE INDEX idx_notifications_wallet_id ON notifications (wallet_id);
