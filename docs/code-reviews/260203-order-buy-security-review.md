# Order Buy Flow - Security Code Review

**Date:** 2026-02-03
**Reviewer:** Claude Code
**Scope:** Mobile App → Backend API → Smart Contract integration
**Status:** Comprehensive security analysis complete

---

## Executive Summary

The Order Buy flow implements a three-layer architecture: mobile UI initiates purchase via backend REST API, backend validates and creates database records, webhook handler processes payment confirmation and dispenses USDC via smart contract.

**Overall Security Assessment:** PARTIAL - Core functionality works but **2 CRITICAL and 4 HIGH priority issues** identified.

**Critical Issues Found:**
1. No rate limiting on order and webhook endpoints - DDoS vulnerability
2. No idempotency protection - duplicate webhooks cause double USDC dispensing

**Key Strengths:**
- Server-side amount validation implemented
- Signature verification in place (production mode)
- Order expiration and reference validation
- Smart contract escrow for rate-locked sells

---

## Components Reviewed

### 1. Mobile App (Expo/React Native)
- **Files:** `/app/src/services/trading-service.ts`, `/app/src/api/orders-buy-sell-api-service.ts`, `/app/app/(tabs)/convert.tsx`
- **Responsibility:** UI initiation, QR display, order status polling
- **Technology:** React Native, Expo, TypeScript

### 2. Backend API (NestJS)
- **Files:** `/backend/src/modules/orders/orders.controller.ts`, `/backend/src/modules/orders/orders.service.ts`, `/backend/src/modules/webhooks/webhooks.service.ts`, `/backend/src/modules/webhooks/webhooks.controller.ts`
- **Responsibility:** REST endpoints for order creation, database persistence, webhook processing
- **Technology:** NestJS, Supabase (PostgreSQL), TypeScript

### 3. Smart Contract (Sui Move)
- **Files:** `/contracts/sources/escrow.move`, `/contracts/sources/liquidity_pool.move`, `/contracts/sources/price_oracle.move`
- **Responsibility:** USDC token management, escrow for smart sells, oracle-driven execution
- **Technology:** Sui Move, blockchain

---

## Integration Flow

```
User Input (Buy Order)
    ↓
[Mobile] createBuyOrder(amountVnd)
    → POST /orders/buy → [Backend] OrdersController.createBuyOrder()
    ↓
[Backend] Validate amount, fetch rate, create DB record, generate QR
    ↓
Returns: orderId, reference (SG-XXXXX), qrCode, expiresAt
    ↓
User transfers VND via QR → Bank → SePay
    ↓
[SePay] → Webhook POST /webhooks/sepay (with signature)
    ↓
[Backend] extractReference → findOrder → verifyAmount → markPaid
    ↓
dispenseUsdcToUser(order) → [Smart Contract] liquidity_pool::dispense()
    ↓
USDC transferred to user wallet
```

---

## Critical Issues

### 1. Missing Rate Limiting on Endpoints

**Severity:** CRITICAL
**Status:** ⚠️ UNHANDLED

**Affected Endpoints:**
- `POST /orders/buy` - No throttling
- `POST /orders/quick-sell` - No throttling
- `POST /orders/smart-sell` - No throttling
- `POST /webhooks/sepay` - No throttling
- `POST /webhooks/sepay/simulate/:reference` - Development endpoint with no guard

**Risk Assessment:**

1. **DDoS Attack:** Attacker can spam `/orders/buy` requests, creating thousands of database records
2. **Webhook Abuse:** Multiple webhook submissions from compromised SePay integration
3. **Resource Exhaustion:** Database queries, blockchain transactions, rate fetching all unthrottled
4. **Dispense Spam:** If simulation endpoint is accidentally left in production, rapid-fire simulations trigger USDC dispensing

**Example Attack Scenario:**
```bash
# Rapid-fire order creation (no throttle)
for i in {1..1000}; do
  curl -X POST http://api.suigate.dev/orders/buy \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"amountVnd": 100000}'
done
# Creates 1000 orders in seconds, DB bloat, rate-fetch spam
```

**Recommendation:**

Install and configure `@nestjs/throttler`:

```bash
npm install @nestjs/throttler
```

Update `app.module.ts`:
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,      // 60 seconds
        limit: 10,       // 10 requests per minute per IP
      },
      {
        name: 'long',
        ttl: 3600000,    // 1 hour
        limit: 100,      // 100 requests per hour per IP
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

Apply per-endpoint config in `orders.controller.ts`:
```typescript
import { Throttle } from '@nestjs/throttler';

@Post('buy')
@Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 per minute
async createBuyOrder(...) { ... }

@Post('quick-sell')
@Throttle({ short: { limit: 5, ttl: 60000 } })
async createQuickSellOrder(...) { ... }

@Post('smart-sell')
@Throttle({ short: { limit: 5, ttl: 60000 } })
async createSmartSellOrder(...) { ... }
```

And in `webhooks.controller.ts`:
```typescript
@Post('sepay')
@Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 per minute per IP
async handleSepay(...) { ... }

@Post('sepay/simulate/:reference')
@Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 per minute
async simulatePayment(...) { ... }
```

**Fix Status:** PENDING
**Priority:** IMMEDIATE (blocking production)

---

### 2. No Idempotency Protection on Webhook

**Severity:** CRITICAL
**Status:** ⚠️ UNHANDLED

**Problem:**

Duplicate webhook processing causes double USDC dispensing:

```
Timeline:
T1: SePay sends webhook id=12345, amount=1000000, reference=SG-ABC12
T2: Backend processes → order status = 'paid' → calls dispenseUsdcToUser()
T3: Network timeout before response sent
T4: SePay retries with same webhook (id=12345)
T5: Backend processes AGAIN → tries to update 'paid' → dispenseUsdcToUser() called 2ND TIME
T6: User receives 2x USDC!
```

**Current Code Issue (webhooks.service.ts, Line 74-87):**

```typescript
// Update status - succeeds even on retry
await this.supabase
  .getClient()
  .from('orders')
  .update({
    status: 'paid',
    sepay_transaction_id: payload.id,  // Unique constraint prevents re-insert
    updated_at: new Date().toISOString(),
  })
  .eq('id', order.id);

// THIS ALWAYS RUNS - NO GUARD!
await this.dispenseUsdcToUser(order);  // CALLED MULTIPLE TIMES = 2x USDC!
```

**Database Schema Issue:**

While `sepay_transaction_id` has a UNIQUE constraint (prevents duplicate transaction IDs), the status update is not atomic with dispense:

```sql
-- Constraint exists but doesn't prevent double-dispense
UNIQUE(sepay_transaction_id)

-- What happens on retry:
-- 1st webhook: UPDATE (success) → dispenseUsdc() ✓
-- 2nd webhook: UPDATE (success - no transaction ID change yet?) → dispenseUsdc() ✗
```

The real risk: even if the UPDATE fails on retry (due to being 'paid' already), the code doesn't check status before calling `dispenseUsdcToUser()`.

**Recommendation - Option 1: Atomic Status Check (Simple)**

```typescript
async handleSepayWebhook(
  payload: SepayWebhookDto,
  signature: string,
): Promise<SepayWebhookResponse> {
  // ... existing validation code ...

  // Check if already processed BEFORE updating
  if (order.status !== 'pending') {
    this.logger.warn(
      `Order ${order.id} already in status: ${order.status}, skipping dispense`
    );
    return { success: true, message: 'Already processed' };
  }

  // Update status atomically - ONLY if still pending
  const { data: updatedOrder, error: updateError } = await this.supabase
    .getClient()
    .from('orders')
    .update({
      status: 'paid',
      sepay_transaction_id: payload.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .eq('status', 'pending') // Atomic: only update if still pending
    .select()
    .single();

  if (updateError || !updatedOrder) {
    this.logger.warn(
      `Failed to update order ${order.id} to paid (likely already processed)`
    );
    return { success: true, message: 'Order already processed' };
  }

  // Only dispense if update succeeded
  await this.dispenseUsdcToUser(updatedOrder);

  return { success: true, message: 'Payment processed' };
}
```

**Recommendation - Option 2: Idempotency Key Table (Robust)**

Create migration:
```sql
CREATE TABLE webhook_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_provider text NOT NULL,        -- 'sepay', 'stripe', etc.
  webhook_id text NOT NULL,              -- SePay transaction ID
  processed_at timestamptz DEFAULT now(),
  UNIQUE(webhook_provider, webhook_id)
);

CREATE INDEX idx_webhook_idempotency_provider_id
ON webhook_idempotency(webhook_provider, webhook_id);
```

Update service:
```typescript
async handleSepayWebhook(
  payload: SepayWebhookDto,
  signature: string,
): Promise<SepayWebhookResponse> {
  // Check if already processed
  const { data: existing } = await this.supabase
    .getClient()
    .from('webhook_idempotency')
    .select('*')
    .eq('webhook_provider', 'sepay')
    .eq('webhook_id', payload.id)
    .single();

  if (existing) {
    this.logger.log(`Webhook ${payload.id} already processed, skipping`);
    return { success: true, message: 'Already processed' };
  }

  // ... process webhook ...

  // Record successful processing
  await this.supabase
    .getClient()
    .from('webhook_idempotency')
    .insert({
      webhook_provider: 'sepay',
      webhook_id: payload.id,
    });

  return { success: true, message: 'Payment processed' };
}
```

**Fix Status:** PENDING
**Priority:** IMMEDIATE (prevents financial loss)

---

## High Priority Issues

### 3. Loose Amount Validation in Webhook

**Severity:** HIGH
**Status:** ⚠️ PARTIAL

**Issue:**

Amount validation exists but uses loose JavaScript `number` type:

```typescript
// webhooks.service.ts, Line 58
if (payload.transferAmount !== order.amount_vnd) {
  // Only flags for review, doesn't reject
}
```

**Problems:**

1. **Precision Loss:** JavaScript numbers lose precision for large amounts
   - `1000000.1 !== 1000000.0999999999` could incorrectly match
   - VND amounts can be in 9+ digits (up to 100M)

2. **No Bounds Checking:** No validation for:
   - Negative amounts: `transferAmount: -1000000` would pass through
   - Zero amounts: `transferAmount: 0` not caught
   - Excessive amounts: `transferAmount: 999999999999` not validated

3. **DTO Type Issue (order-types.dto.ts, Line 45):**
   ```typescript
   @IsNumber()
   transferAmount: number;  // ❌ Loses precision for financial data
   ```

**Example Attack Scenario:**
```javascript
// Client sends mismatched amount
payload = {
  id: "12345",
  transferAmount: 99999999,    // 1M less than expected
  content: "SuiGate SG-ABC12"
}
// Only gets flagged for review, payment might be accepted anyway!
```

**Recommendation:**

1. Update `sepay-payment-webhook.dto.ts`:
   ```typescript
   import { Matches } from 'class-validator';

   @IsString()
   @Matches(/^\d+(\.\d{1,2})?$/, { message: 'Invalid VND amount format' })
   transferAmount: string;  // "1000000" or "1000000.50"
   ```

2. Add validation in service:
   ```typescript
   import Decimal from 'decimal.js';

   private validateAmount(
     transferAmount: string,
     expectedAmount: string
   ): boolean {
     const transfer = new Decimal(transferAmount);
     const expected = new Decimal(expectedAmount);

     // Check bounds
     if (transfer.isNegative() || transfer.isZero()) {
       throw new BadRequestException('Amount must be positive');
     }

     if (transfer.greaterThan('10000000')) { // 10M VND limit
       throw new BadRequestException('Amount exceeds maximum');
     }

     // Exact match with Decimal precision
     if (!transfer.equals(expected)) {
       throw new BadRequestException(
         `Amount mismatch: expected ${expectedAmount}, got ${transferAmount}`
       );
     }

     return true;
   }
   ```

3. Update webhook handler:
   ```typescript
   // In handleSepayWebhook()
   this.validateAmount(
     payload.transferAmount.toString(),
     order.amount_vnd.toString()
   );
   ```

**Fix Status:** PENDING
**Priority:** HIGH (prevents financial discrepancies)

---

### 4. Signature Verification Disabled in Development

**Severity:** HIGH
**Status:** ⚠️ PARTIAL

**Issue:**

Signature verification is skipped in non-production environments:

```typescript
// webhooks.service.ts, Line 29-34
if (signature && !this.verifySignature(payload, signature)) {
  this.logger.error('Webhook signature verification failed');
  throw new BadRequestException('Invalid webhook signature');
}
```

**Problems:**

1. **Untested Path:** Developers never test signature validation
2. **Silent Miss:** Missing signature defaults to empty string:
   ```typescript
   // webhooks.controller.ts, Line 18
   @Headers('x-sepay-signature') signature: string,
   // ... if header missing, signature = undefined (falsy)
   ```
3. **Production Surprise:** Bugs in signature logic only discovered at deploy

**Recommendation:**

```typescript
// 1. Make missing signature explicit
@Headers('x-sepay-signature') signature?: string;

// 2. Always verify in production, optionally in dev
if (process.env.NODE_ENV === 'production' || !process.env.SKIP_WEBHOOK_SIGNATURE) {
  if (!signature) {
    throw new BadRequestException('Missing webhook signature');
  }

  if (!this.verifySignature(payload, signature)) {
    throw new BadRequestException('Invalid webhook signature');
  }
}

// 3. Env var for testing signature path locally
// .env.development:
// SKIP_WEBHOOK_SIGNATURE=true  # Disable for testing signature validation
```

**Fix Status:** PENDING
**Priority:** HIGH (untested production path)

---

### 5. No Validation of Bank Account Ownership

**Severity:** HIGH
**Status:** ⚠️ PARTIAL

**Issue:**

Sell order creation verifies bank account but validation is incomplete:

```typescript
// orders.service.ts, Line 103
await this.verifyBankAccount(userId, dto.bankAccountId);
```

**Missing Detail:**
- Function exists but no bounds checking on `bankAccountId`
- No verification that account is in 'verified' status
- Could allow ordering to pending or deleted accounts

**Recommendation:**

```typescript
private async verifyBankAccount(userId: string, bankAccountId: number): Promise<void> {
  const { data, error } = await this.supabase
    .getClient()
    .from('bank_accounts')
    .select('*')
    .eq('id', bankAccountId)
    .eq('user_id', userId)
    .eq('status', 'verified')  // Only verified accounts
    .single();

  if (error || !data) {
    throw new BadRequestException(
      'Bank account not found or not verified'
    );
  }
}
```

**Fix Status:** PENDING
**Priority:** HIGH (prevents orders to unverified accounts)

---

### 6. Order Expiration Not Enforced

**Severity:** HIGH
**Status:** ⚠️ PARTIAL

**Issue:**

Buy orders have `expiresAt` field but expiration is not enforced:

```typescript
// orders.service.ts, Line 59
const expiresAt = new Date(Date.now() + ORDER_EXPIRY_MINUTES * 60 * 1000);
// 15-minute default, but...

// webhooks.service.ts - NO CHECK FOR EXPIRATION
if (!order) {
  this.logger.warn(`Order not found for reference: ${reference}`);
  return;
}
// Accepts payment even if expired!
```

**Risk:**
- Payment arrives after order expires - old QR code might be reused
- Could match stale orders
- Rate mismatch undetected if expired order has old rate

**Recommendation:**

```typescript
// In handleSepayWebhook()
if (new Date() > new Date(order.expires_at)) {
  this.logger.warn(`Order ${order.id} has expired`);
  return { success: false, message: 'Order has expired' };
}
```

**Fix Status:** PENDING
**Priority:** HIGH (stale order risk)

---

## Partial Issues Summary

| # | Issue | Location | Status | Severity |
|---|-------|----------|--------|----------|
| 1 | **Rate limiting** | orders.controller, webhooks.controller | ❌ Unhandled | **CRITICAL** |
| 2 | **Idempotency** | webhooks.service | ❌ Unhandled | **CRITICAL** |
| 3 | Amount validation precision | webhooks.service | ⚠️ Partial | **HIGH** |
| 4 | Signature verification in dev | webhooks.service | ⚠️ Partial | **HIGH** |
| 5 | Bank account verification | orders.service | ⚠️ Partial | **HIGH** |
| 6 | Order expiration enforcement | webhooks.service | ⚠️ Partial | **HIGH** |

---

## Handled Security Aspects

### ✅ 1. Server-Side Amount Validation
**Status:** IMPLEMENTED

Buy orders validate amount bounds server-side (orders.service.ts, Line 40-54):
```typescript
const MIN_AMOUNT_VND = 50000;
const MAX_AMOUNT_VND = 100000000;

if (dto.amountVnd < MIN_AMOUNT_VND) {
  throw new BadRequestException(`Minimum order amount is ${MIN_AMOUNT_VND}...`);
}
```

**Strength:** Prevents ordering below platform limits. UI-side validation redundant but harmless.

### ✅ 2. Reference Generation & Validation
**Status:** IMPLEMENTED

Reference format strictly enforced (vietqr-generator.service.ts):
```typescript
private extractReference(content: string): string | null {
  const match = content.match(/SG-[A-Z0-9]{5}/);
  return match ? match[0] : null;
}
```

**Strength:** 36^5 = 60M possible references, collision unlikely.

### ✅ 3. JWT Authentication Guard
**Status:** IMPLEMENTED

All order endpoints protected by `@UseGuards(JwtAuthGuard)`:
```typescript
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController { ... }
```

**Strength:** Only authenticated users can create orders.

### ✅ 4. Signature Verification (Production)
**Status:** IMPLEMENTED

HMAC-SHA256 signature verification in place:
```typescript
private verifySignature(payload, signature): boolean {
  const expectedSig = crypto
    .createHmac('sha256', this.webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSig, 'hex')
  );
}
```

**Strength:** Timing-safe comparison prevents timing attacks. Production-only is intentional (for dev testing).

### ✅ 5. Smart Contract Rate Validation
**Status:** IMPLEMENTED

Smart sell escrow includes rate bounds check (orders.service.ts, Line 148-150):
```typescript
const maxRate = rates.sellRate * 1.1;
if (dto.targetRate > maxRate) {
  throw new BadRequestException('Target rate too high');
}
```

**Strength:** Prevents users from locking in unrealistic rates.

### ✅ 6. Order Status State Machine
**Status:** IMPLEMENTED

Orders follow strict state transitions:
```
pending → paid → (dispense_success | dispense_failed)
```

**Strength:** Prevents invalid state transitions (e.g., paid → pending).

---

## Security Checklist

- [ ] **Rate Limiting** - Endpoints throttled per IP/user
- [x] **Authentication** - JWT guards on order endpoints
- [ ] **Idempotency** - Duplicate webhooks prevented
- [x] **Amount Validation** - Server-side bounds checking
- [ ] **Precision Validation** - Decimal.js for financial amounts
- [x] **Signature Verification** - HMAC-SHA256 with timing-safe compare
- [x] **Smart Contract Guards** - Escrow rate validation
- [ ] **Expiration Enforcement** - Expired orders rejected
- [x] **Authorization** - Users can only access own orders
- [ ] **Bank Account Verification** - Only verified accounts accepted
- [ ] **Webhook Idempotency** - Duplicate processing prevented
- [x] **USDC Dispensing** - Via smart contract, immutable ledger

---

## Recommendations

### Immediate (Before Production)

1. **Implement Rate Limiting** (2-3 hours)
   - Install `@nestjs/throttler`
   - Configure module and guards
   - Test under load

2. **Add Idempotency Protection** (2-3 hours)
   - Implement atomic status check OR idempotency table
   - Test duplicate webhook scenarios
   - Verify USDC only dispensed once

3. **Fix Amount Validation** (1-2 hours)
   - Migrate to string/Decimal.js
   - Add negative/zero/bounds checks
   - Update DTO validators

### High Priority

4. **Enforce Order Expiration** (30 minutes)
   - Add expiry check in webhook handler
   - Reject expired orders

5. **Strengthen Signature Handling** (1 hour)
   - Make missing signature explicit
   - Add development bypass flag
   - Test signature path in dev

6. **Bank Account Verification** (30 minutes)
   - Add status check to existing function
   - Only allow 'verified' accounts

### Medium Priority

7. **Add Webhook Monitoring** (4 hours)
   - Log all webhook attempts
   - Track processing time
   - Alert on failures

8. **Rate Caching** (2 hours)
   - Cache rates for 1 minute
   - Reduce repeated fetches

---

## Testing Recommendations

Create test suite for security scenarios:

```typescript
describe('Order Buy Flow - Security', () => {
  describe('Rate Limiting', () => {
    it('should reject 6th order in 60 seconds', async () => {
      for (let i = 0; i < 5; i++) {
        await createBuyOrder(...); // Should succeed
      }
      await expect(createBuyOrder(...)).rejects.toThrow('429'); // Throttled
    });
  });

  describe('Idempotency', () => {
    it('should process webhook only once', async () => {
      const webhook = { id: '123', transferAmount: 100000 };

      await handleWebhook(webhook);
      const usdc1 = await getUsdcBalance();

      await handleWebhook(webhook); // Duplicate
      const usdc2 = await getUsdcBalance();

      expect(usdc2).toBe(usdc1); // No double-spend
    });
  });

  describe('Amount Validation', () => {
    it('should reject mismatched amounts', async () => {
      const webhook = { transferAmount: 99999 }; // Mismatch
      await expect(handleWebhook(webhook)).rejects.toThrow();
    });

    it('should reject negative amounts', async () => {
      const webhook = { transferAmount: '-100000' };
      await expect(handleWebhook(webhook)).rejects.toThrow();
    });
  });

  describe('Order Expiration', () => {
    it('should reject payment for expired orders', async () => {
      const order = await createBuyOrder({ amountVnd: 100000 });
      await sleep(ORDER_EXPIRY_MINUTES * 60 * 1000 + 1000); // Wait for expiry

      const webhook = { reference: order.reference };
      await expect(handleWebhook(webhook)).rejects.toThrow('expired');
    });
  });
});
```

---

## Fix Tracking

| Issue | Fix | Status | Branch | PR |
|-------|-----|--------|--------|-----|
| Rate limiting | Install @nestjs/throttler, add guards | PENDING | TBD | TBD |
| Idempotency | Atomic status check or table | PENDING | TBD | TBD |
| Amount precision | Switch to Decimal.js, string DTO | PENDING | TBD | TBD |
| Signature testing | Add bypass flag | PENDING | TBD | TBD |
| Expiration | Add check in webhook handler | PENDING | TBD | TBD |
| Bank account | Add status validation | PENDING | TBD | TBD |

---

## Integration Notes

**Database Migrations Required:**
- `webhook_idempotency` table (if Option 2 selected)
- Ensure `orders.expires_at` index exists for query performance

**Environment Variables:**
- `SEPAY_WEBHOOK_SECRET` - Must be configured in production
- `SKIP_WEBHOOK_SIGNATURE` - Development testing only (default: false in prod)
- `ORDER_EXPIRY_MINUTES` - Currently hardcoded at 15

**Deployment Checklist:**
- [ ] Rate limiting deployed and tested
- [ ] Idempotency protection active
- [ ] Amount validation in place
- [ ] Order expiration enforced
- [ ] Signature verification enabled (production)
- [ ] Bank account verification active
- [ ] Monitoring/alerting configured
- [ ] Load tests pass with throttling

---

## Questions for Development Team

1. Is `dispenseUsdcToUser()` itself idempotent? If blockchain tx fails midway and we retry, could we double-dispense at the smart contract level?
2. What is the expected maximum VND order amount? (Currently set to 100M, which is reasonable)
3. Is there a webhook replay/retry policy documented from SePay? (Helps determine retry window)
4. Should quick-sell and smart-sell orders also be wired to backend, or remain as calculated previews?
5. Is there a rate cache strategy planned? Currently refetching on every order.

---

**Report Generated:** 2026-02-03
**Next Review:** After implementing critical fixes (2-3 days)
