-- Add lock-related fields to users table
-- Run this migration in Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_by UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lock_reason TEXT;

-- Add index for faster queries on locked users
CREATE INDEX IF NOT EXISTS idx_users_is_locked ON users(is_locked);

-- Add foreign key constraint for locked_by (references users table)
ALTER TABLE users ADD CONSTRAINT fk_users_locked_by
  FOREIGN KEY (locked_by) REFERENCES users(id) ON DELETE SET NULL;

COMMENT ON COLUMN users.is_locked IS 'Whether the user account is locked';
COMMENT ON COLUMN users.locked_at IS 'Timestamp when the user was locked';
COMMENT ON COLUMN users.locked_by IS 'Admin user ID who locked this account';
COMMENT ON COLUMN users.lock_reason IS 'Reason for locking the account';
