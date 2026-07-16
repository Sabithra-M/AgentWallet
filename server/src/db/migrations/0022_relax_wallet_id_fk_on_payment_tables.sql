-- AI Wallets must be deletable even after they've been used for a payment
-- request (their whole purpose is generating payment requests). Deleting a
-- wallet should never delete the payment/audit history it left behind, so
-- these become nullable + SET NULL instead of RESTRICT, matching the
-- notifications.wallet_id precedent from migration 0021.
ALTER TABLE payment_requests ALTER COLUMN wallet_id DROP NOT NULL;
ALTER TABLE payment_requests DROP CONSTRAINT payment_requests_wallet_id_fkey;
ALTER TABLE payment_requests
  ADD CONSTRAINT payment_requests_wallet_id_fkey
  FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE SET NULL;

ALTER TABLE payment_transactions ALTER COLUMN wallet_id DROP NOT NULL;
ALTER TABLE payment_transactions DROP CONSTRAINT payment_transactions_wallet_id_fkey;
ALTER TABLE payment_transactions
  ADD CONSTRAINT payment_transactions_wallet_id_fkey
  FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE SET NULL;
