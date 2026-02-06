-- Order Matching Schema Migration
-- Adds support for smart sell order book matching with partial fills

-- Add partial fill tracking columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS filled_usdc DECIMAL(18,6) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS remaining_usdc DECIMAL(18,6),
  ADD COLUMN IF NOT EXISTS fill_history JSONB DEFAULT '[]'::jsonb;

-- Match status enum for order_matches table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status_enum') THEN
    CREATE TYPE match_status_enum AS ENUM ('pending', 'executed', 'settled');
  END IF;
END$$;

-- Order matches table - tracks each buy-sell match
CREATE TABLE IF NOT EXISTS order_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buy_order_id UUID NOT NULL REFERENCES orders(id),
  sell_order_id UUID NOT NULL REFERENCES orders(id),
  amount_usdc DECIMAL(18,6) NOT NULL,
  rate DECIMAL(12,4) NOT NULL,
  amount_vnd DECIMAL(18,2) NOT NULL,
  tx_hash TEXT,
  status match_status_enum DEFAULT 'pending',
  vnd_settled BOOLEAN DEFAULT FALSE,
  settled_by UUID REFERENCES users(id),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for matching query: find active smart sells by price
CREATE INDEX IF NOT EXISTS idx_smart_sell_matching ON orders (target_rate ASC, created_at ASC)
  WHERE order_type = 'smart_sell' AND status = 'processing' AND remaining_usdc > 0;

-- Index for looking up matches by sell order
CREATE INDEX IF NOT EXISTS idx_order_matches_sell ON order_matches(sell_order_id);

-- Index for looking up matches by buy order
CREATE INDEX IF NOT EXISTS idx_order_matches_buy ON order_matches(buy_order_id);

-- Index for pending settlements query
CREATE INDEX IF NOT EXISTS idx_order_matches_pending_settlement ON order_matches(created_at)
  WHERE status = 'executed' AND vnd_settled = FALSE;

-- Enable RLS on order_matches
ALTER TABLE order_matches ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can see matches for their own orders
CREATE POLICY order_matches_isolation ON order_matches FOR ALL
  USING (
    buy_order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    OR sell_order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

-- Function to update smart sell fill (atomic update)
CREATE OR REPLACE FUNCTION update_smart_sell_fill(
  p_order_id UUID,
  p_fill_amount DECIMAL(18,6)
) RETURNS VOID AS $$
BEGIN
  UPDATE orders
  SET
    filled_usdc = COALESCE(filled_usdc, 0) + p_fill_amount,
    remaining_usdc = COALESCE(remaining_usdc, amount_usdc) - p_fill_amount,
    updated_at = NOW()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;

-- Comment on table
COMMENT ON TABLE order_matches IS 'Tracks buy-sell order matches for smart sell order book';
COMMENT ON COLUMN orders.filled_usdc IS 'Amount of USDC already matched and dispensed';
COMMENT ON COLUMN orders.remaining_usdc IS 'Amount of USDC waiting to be matched';
COMMENT ON COLUMN orders.fill_history IS 'JSON array of fill events for display';
