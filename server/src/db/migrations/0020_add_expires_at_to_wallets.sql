-- NULL for the Main Wallet and any pre-existing category wallets; required
-- (enforced at the application layer) for AI Wallets.
ALTER TABLE wallets ADD COLUMN expires_at TIMESTAMPTZ;
