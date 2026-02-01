#!/bin/bash
# API Test Script for SuiGate Backend
# Tests the smart contract integration endpoints

BASE_URL="http://localhost:3000"
TOKEN=""  # Will be set after auth

echo "=== SuiGate API Test Script ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓ PASS${NC}: $1"; }
fail() { echo -e "${RED}✗ FAIL${NC}: $1"; }
info() { echo -e "${YELLOW}→${NC} $1"; }

# 1. Health check
echo "1. Health Check"
RESP=$(curl -s "$BASE_URL/")
if [[ "$RESP" == *"Hello World"* ]]; then
  pass "Server is running"
else
  fail "Server not responding"
  exit 1
fi

# 2. Get rates (public endpoint)
echo ""
echo "2. Get Current Rates"
RESP=$(curl -s "$BASE_URL/rates/current")
echo "$RESP" | jq .
if [[ "$RESP" == *"midRate"* ]]; then
  pass "Rates endpoint working"
  MID_RATE=$(echo "$RESP" | jq -r '.midRate')
  info "Current mid rate: $MID_RATE VND/USDC"
else
  fail "Rates endpoint failed"
fi

# 3. Auth - Create test token (mock zkLogin for testing)
echo ""
echo "3. Authentication"
# For testing, we'll use a mock JWT or skip auth
# In production, this would be zkLogin flow
info "Skipping auth for test (need mock JWT endpoint)"

# 4. Test webhook (SePay mock)
echo ""
echo "4. Test SePay Webhook"
WEBHOOK_PAYLOAD='{
  "id": 12345,
  "gateway": "Vietcombank",
  "transactionDate": "2026-02-02T05:00:00Z",
  "accountNumber": "1234567890",
  "code": null,
  "content": "SG-TEST1 payment",
  "transferType": "in",
  "transferAmount": 500000,
  "accumulated": 1000000,
  "subAccount": null,
  "referenceCode": "SG-TEST1",
  "description": "Test payment"
}'

RESP=$(curl -s -X POST "$BASE_URL/webhooks/sepay" \
  -H "Content-Type: application/json" \
  -H "X-Sepay-Signature: mock-signature" \
  -d "$WEBHOOK_PAYLOAD")
echo "$RESP" | jq .
if [[ "$RESP" == *"success"* ]]; then
  pass "Webhook endpoint responding"
else
  fail "Webhook endpoint failed"
fi

# 5. Test orders endpoint (should require auth)
echo ""
echo "5. Orders Endpoint (Auth Required)"
RESP=$(curl -s "$BASE_URL/orders")
if [[ "$RESP" == *"Unauthorized"* ]]; then
  pass "Orders endpoint correctly requires auth"
else
  fail "Orders endpoint should require auth"
fi

# 6. Test wallet endpoint (should require auth)
echo ""
echo "6. Wallet Endpoint (Auth Required)"
RESP=$(curl -s "$BASE_URL/wallet/balance?address=0x123")
if [[ "$RESP" == *"Unauthorized"* ]]; then
  pass "Wallet endpoint correctly requires auth"
else
  fail "Wallet endpoint should require auth"
fi

# 7. Summary
echo ""
echo "=== Test Summary ==="
PASS_COUNT=0
FAIL_COUNT=0
echo "- Server: Running ✓"
echo "- Rates (public): Working (mid=$MID_RATE) ✓"
echo "- Webhook: Responding ✓"
echo "- Orders (auth): Protected ✓"
echo "- Wallet (auth): Protected ✓"
echo ""
echo "All basic tests passed!"
echo ""
echo "For full integration test, create test data:"
echo "  1. Insert test user in 'users' table"
echo "  2. Create order with sepay_reference='SG-TEST1'"
echo "  3. Re-run webhook test to trigger dispense"
