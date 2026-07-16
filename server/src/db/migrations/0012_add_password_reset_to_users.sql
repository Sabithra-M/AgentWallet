-- Password reset flow: a raw token is emailed to the user, but only its
-- SHA-256 hash is ever stored (same principle as never storing plaintext
-- passwords) — see auth.service.js's forgotPassword/resetPassword.
ALTER TABLE users
  ADD COLUMN reset_token_hash TEXT,
  ADD COLUMN reset_token_expires_at TIMESTAMPTZ;

CREATE INDEX idx_users_reset_token_hash ON users (reset_token_hash);
