ALTER TABLE wallets ADD COLUMN is_main BOOLEAN NOT NULL DEFAULT false;

-- At most one Main Wallet per user.
CREATE UNIQUE INDEX idx_wallets_one_main_per_user ON wallets (user_id) WHERE is_main = true;
