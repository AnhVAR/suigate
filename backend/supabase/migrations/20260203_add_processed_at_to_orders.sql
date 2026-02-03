-- Add processed_at field for idempotency tracking
-- This timestamp tracks when the webhook was processed to prevent duplicate USDC dispensing

ALTER TABLE orders
ADD COLUMN processed_at timestamptz;

-- Create index for faster lookups on processed orders
CREATE INDEX idx_orders_processed_at ON orders(processed_at)
WHERE processed_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN orders.processed_at IS 'Timestamp when webhook was processed and USDC was dispensed. Used for idempotency checks.';
