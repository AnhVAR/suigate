-- Add admin_role column to users table
-- This column determines if a user can access the admin dashboard

ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_role VARCHAR(20) DEFAULT NULL;

-- Add check constraint for valid roles
ALTER TABLE users ADD CONSTRAINT check_admin_role
  CHECK (admin_role IS NULL OR admin_role IN ('admin', 'support'));

-- Create index for admin queries (partial index for performance)
CREATE INDEX IF NOT EXISTS idx_users_admin_role
  ON users(admin_role)
  WHERE admin_role IS NOT NULL;

-- Comment on column
COMMENT ON COLUMN users.admin_role IS 'Admin role: admin (full access) or support (read-only), NULL for regular users';
