-- SuiGate Initial Database Schema
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUMs
CREATE TYPE kyc_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE order_type_enum AS ENUM ('buy', 'quick_sell', 'smart_sell');
CREATE TYPE order_status_enum AS ENUM ('pending', 'paid', 'processing', 'settled', 'cancelled', 'failed');
CREATE TYPE tx_status_enum AS ENUM ('pending', 'confirmed', 'failed');

-- Users table (standalone, no auth.users dependency)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id text UNIQUE,
  apple_id text UNIQUE,
  sui_address text NOT NULL UNIQUE,
  kyc_status kyc_status_enum DEFAULT 'pending',
  location_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bank accounts (encrypted account numbers)
CREATE TABLE bank_accounts (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_number_encrypted text NOT NULL,
  bank_code varchar(20) NOT NULL,
  account_holder varchar(100) NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  bank_account_id bigint REFERENCES bank_accounts(id),
  order_type order_type_enum NOT NULL,
  amount_vnd decimal(18,2),
  amount_usdc decimal(18,6),
  rate decimal(12,4) NOT NULL,
  target_rate decimal(12,4),
  status order_status_enum DEFAULT 'pending',
  escrow_object_id text,
  sepay_reference text UNIQUE,
  sepay_transaction_id text UNIQUE,
  needs_manual_review boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions (blockchain tx tracking)
CREATE TABLE transactions (
  id bigserial PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tx_hash text NOT NULL,
  tx_status tx_status_enum DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Conversion rates (cache)
CREATE TABLE conversion_rates (
  id bigserial PRIMARY KEY,
  mid_rate decimal(12,4) NOT NULL,
  buy_rate decimal(12,4) NOT NULL,
  sell_rate decimal(12,4) NOT NULL,
  spread_bps integer NOT NULL,
  source varchar(50) NOT NULL,
  fetched_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_users_sui_address ON users(sui_address);
CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_sepay ON orders(sepay_reference);
CREATE INDEX idx_orders_smart_sell ON orders(order_type, status)
  WHERE order_type = 'smart_sell' AND status = 'pending';
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_conversion_rates_fetched ON conversion_rates(fetched_at DESC);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access own data)
-- Note: Backend uses service_role_key which bypasses RLS
CREATE POLICY users_isolation ON users FOR ALL USING (id = auth.uid());
CREATE POLICY bank_accounts_isolation ON bank_accounts FOR ALL USING (user_id = auth.uid());
CREATE POLICY orders_isolation ON orders FOR ALL USING (user_id = auth.uid());
CREATE POLICY transactions_isolation ON transactions FOR ALL
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Note: conversion_rates is public read, no RLS needed
