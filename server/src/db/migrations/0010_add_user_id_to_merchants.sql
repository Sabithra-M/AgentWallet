-- Merchants was originally a shared global lookup table (see migration 0003).
-- This migration converts it to per-user ownership: each user manages their
-- own merchant list. Table is empty at the time of this migration, so a
-- NOT NULL column can be added directly with no backfill needed.

ALTER TABLE merchants
  ADD COLUMN user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE;

CREATE INDEX idx_merchants_user_id ON merchants (user_id);

-- Merchant names were globally unique; now two different users may each have
-- their own "Amazon" entry, but a single user still can't duplicate a name.
ALTER TABLE merchants DROP CONSTRAINT merchants_name_key;
ALTER TABLE merchants ADD CONSTRAINT merchants_user_id_name_key UNIQUE (user_id, name);
