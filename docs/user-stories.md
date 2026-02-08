# SuiGate MVP - User Stories

**Scope:** MVP for 8-day hackathon (ETHGlobal HackMoney 2026)
**Format:** Standard (As a... I want... So that...)
**Last Updated:** 2026-02-08 (All 12 stories IMPLEMENTED)

---

## Epic 1: Authentication & Onboarding

### US-01: zkLogin Registration
> As a **Vietnamese crypto beginner**,
> I want to **create a wallet using my Google/Apple account**,
> So that **I don't need to manage seed phrases or private keys**.

**Acceptance Criteria:**
- [x] OAuth flow works with Google
- [x] Wallet address auto-generated after login
- [x] No seed phrase displayed to user
- [x] Session persists via expo-secure-store

**Priority:** P1 | **Effort:** High | **Risk:** High | **Status:** DONE (Days 1-2)

---

### US-02: Mock KYC Verification
> As a **new user**,
> I want to **complete identity verification quickly**,
> So that **I can access VND conversion features**.

**Acceptance Criteria:**
- [x] Mock KYC UI flow (auto-approve for demo)
- [x] "Verified" status stored in Supabase
- [x] Block VND features if not KYC verified
- [x] Display note: "Mock - FPT.AI integration planned"

**Priority:** P2 | **Effort:** Low | **Risk:** Low | **Status:** DONE (Day 2)

---

### US-03: Location Verification
> As a **Vietnamese user**,
> I want to **verify I'm in the sandbox zone**,
> So that **I can access VND conversion features legally**.

**Acceptance Criteria:**
- [x] Request GPS permission on first launch
- [x] Check if user within allowed boundary (500m from Da Nang city center)
- [x] Block VND features (Buy/Sell) if outside zone
- [x] GPS denied: can view balance, block trading with GPS prompt
- [x] Show clear message explaining geographic restriction
- [x] Allow retry location check
- [x] Cache location status (re-verify on app restart)

**Priority:** P2 | **Effort:** Medium | **Risk:** Low | **Status:** DONE (Day 2)

**Implementation:** Da Nang sandbox (10.7769°N, 106.6669°E) with 500m radius.

---

## Epic 2: Wallet Core

### US-04: View USDC Balance
> As a **wallet user**,
> I want to **see my USDC balance on the home screen**,
> So that **I know how much crypto I have available**.

**Acceptance Criteria:**
- [x] Fetch balance from Sui RPC
- [x] Pull-to-refresh functionality
- [x] Loading state while fetching
- [x] Error state on network failure
- [x] Home screen: Balance + Recent transactions + Quick actions (Buy/Sell)
- [x] VND equivalent display (using current rate)

**Priority:** P1 | **Effort:** Low | **Risk:** Low | **Status:** DONE (Day 3)

---

### US-05: Transaction History
> As a **wallet user**,
> I want to **view my past transactions**,
> So that **I can track my activity**.

**Acceptance Criteria:**
- [x] List transactions chronologically (newest first)
- [x] Display: type, amount, status, timestamp
- [x] Filter by type (buy, quick_sell, smart_sell)
- [x] Empty state when no transactions
- [x] Smart Sell orders show fill progress (e.g., "70/100 USDC filled")

**Priority:** P2 | **Effort:** Medium | **Risk:** Low | **Status:** DONE (Day 6)

---

## Epic 3: VND to USDC On-Ramp

### US-06: Buy USDC with VND
> As a **Vietnamese user**,
> I want to **buy USDC directly using bank transfer**,
> So that **I can onboard to crypto without holding VND in app**.

**Flow:**
```
User enters VND amount → Display VietQR → User transfers via bank
→ SePay webhook → Backend converts → USDC minted to wallet
```

**Acceptance Criteria:**
- [x] Input VND amount (min 50,000 VND)
- [x] Display exchange rate (exchange-api) + USDC preview
- [x] Generate SePay VietQR with amount + unique reference
- [x] Countdown timer for QR (15 min expiry)
- [x] Webhook receives transfer notification
- [x] Auto-convert VND → USDC via smart contract
- [x] USDC credited to user wallet
- [x] Transaction recorded in history
- [x] Success/timeout notification
- [x] Late transfer (after expiry) → manual review

**Priority:** P2 | **Effort:** High | **Risk:** High | **Status:** DONE (Day 4)

**Implementation:** SePay production API with webhook, no VND balance stored.

---

## Epic 4: USDC to VND Off-Ramp

### US-07: Quick Sell
> As a **wallet user**,
> I want to **sell USDC instantly at current market rate**,
> So that **I can cash out to VND immediately**.

**Flow:**
```
User selects amount → Confirm rate → Deduct from Liquidity Pool → VND to bank
```

**Acceptance Criteria:**
- [x] Input USDC amount to sell
- [x] Display current rate (exchange-api) + VND output (after 0.5% fee)
- [x] Select bank account from saved list (or add new)
- [x] Match with platform Liquidity Pool
- [x] Auto VND bank transfer (via SePay disbursement)
- [x] Transaction record + status tracking
- [x] Show "Temporarily out of liquidity" if pool insufficient
- [x] Transfer fail → flag for manual review, notify user

**Priority:** P2 | **Effort:** High | **Risk:** Medium | **Status:** DONE (Day 5)

---

### US-08: Smart Sell
> As a **wallet user**,
> I want to **set a target rate and auto-sell when reached**,
> So that **I can get better price and lower fees**.

**Flow:**
```
User sets amount + target rate → USDC locked in escrow → Auto-sell when rate hits → VND received
```

**Benefits vs Quick Sell:**
- Lower fee: 0.5% → 0.2%
- Custom target rate (e.g., sell when >= 27,000 VND/USDC)
- Contribute to platform liquidity

**Acceptance Criteria:**
- [x] Input USDC amount + target VND rate
- [x] Target rate validation: ±10% from current market rate
- [x] Show comparison: Quick Sell vs Smart Sell earnings
- [x] Select bank account from saved list (or add new)
- [x] USDC locked in smart contract escrow (on-chain)
- [x] View active Smart Sell orders in "My Orders"
- [x] Auto-execute when market rate >= target rate (best rate first)
- [x] Partial fill support (VND auto-transferred per fill)
- [x] Cancel order (unlock remaining USDC) anytime
- [x] Fee: 0.2% (vs 0.5% Quick Sell)
- [x] In-app notification on each fill
- [x] Auto-settle fully filled orders

**Priority:** P2 | **Effort:** High | **Risk:** High | **Status:** DONE (Day 5)

**Implementation:** Batch PTB optimization (3 fills → 1 PTB), auto-settle on complete fill.

---

## Epic 5: Basic UI/UX

### US-09: Core Navigation
> As a **mobile user**,
> I want to **navigate between main screens easily**,
> So that **I can access all features quickly**.

**Acceptance Criteria:**
- [x] Bottom tabs: Home, Trade, History, Settings
- [x] Trade screen: Buy USDC / Sell USDC (Quick/Smart)
- [x] Smooth transitions between screens
- [x] Back button works correctly

**Priority:** P1 | **Effort:** Low | **Risk:** Low | **Status:** DONE (Days 1-2)

---

### US-10: Error Handling
> As a **user**,
> I want to **see clear error messages when something fails**,
> So that **I understand what went wrong and how to fix it**.

**Acceptance Criteria:**
- [x] Network errors show retry button
- [x] Validation errors display inline
- [x] Transaction failures include explanation
- [x] No cryptic error codes
- [x] Error boundary for crashes
- [x] Toast notifications for feedback

**Priority:** P1 | **Effort:** Medium | **Risk:** Low | **Status:** DONE (Day 6)

---

### US-11: Multi-language Support (Vi/En)
> As a **Vietnamese user**,
> I want to **use the app in Vietnamese or English**,
> So that **I can understand all features in my preferred language**.

**Acceptance Criteria:**
- [x] Default language based on device locale
- [x] Language switcher in Settings
- [x] All UI text translated (Vi/En)
- [x] Number/currency formatting per locale
- [x] Persist language preference

**Priority:** P2 | **Effort:** Medium | **Risk:** Low | **Status:** DONE (Days 1-2)

---

## Epic 6: Bank Account Management

### US-12: Manage Bank Accounts
> As a **user selling USDC**,
> I want to **save and manage my bank accounts**,
> So that **I don't have to enter bank info every time**.

**Acceptance Criteria:**
- [x] Add new bank account (bank name, account number, account holder)
- [x] List saved bank accounts
- [x] Select from saved accounts when selling USDC
- [x] Edit/delete saved accounts
- [x] Validate account number format
- [x] Default account selection
- [x] AES-256 encryption for sensitive data

**Priority:** P2 | **Effort:** Medium | **Risk:** Low | **Status:** DONE (Day 3)

**Flow:**
```
User initiates sell → Check saved accounts
├── Has accounts → Show picker to select
└── No accounts → Prompt to add new → Save → Continue
```

**Implementation:** Encrypted storage, CRUD endpoints, validation on backend.

---

## Implementation Completion

| Story | Status | Completed | Effort |
|-------|--------|-----------|--------|
| US-01 zkLogin | DONE | Days 1-2 | High |
| US-02 Mock KYC | DONE | Day 2 | Low |
| US-03 Location GPS | DONE | Day 2 | Medium |
| US-04 View Balance | DONE | Day 3 | Low |
| US-05 Tx History | DONE | Day 6 | Medium |
| US-06 Buy USDC | DONE | Day 4 | High |
| US-07 Quick Sell | DONE | Day 5 | High |
| US-08 Smart Sell | DONE | Day 5 | High |
| US-09 Navigation | DONE | Days 1-2 | Low |
| US-10 Error Handling | DONE | Day 6 | Medium |
| US-11 Multi-language | DONE | Days 1-2 | Medium |
| US-12 Bank Accounts | DONE | Day 3 | Medium |

**Total: 12/12 User Stories IMPLEMENTED (100%)**

---

## Implementation Timeline

```
Day 1-2: Auth & Setup
         └─ US-01 (zkLogin) + US-09 (Navigation) + US-11 (i18n setup)

Day 2:   Onboarding
         └─ US-03 (GPS) + US-02 (Mock KYC)

Day 3:   Wallet Core
         └─ US-04 (Balance) + US-12 (Bank Accounts)

Day 4:   On-Ramp
         └─ US-06 (Buy USDC)

Day 5:   Off-Ramp
         └─ US-07 (Quick Sell) + US-08 (Smart Sell)

Day 6:   History & Polish
         └─ US-05 (Tx History) + US-10 (Error handling)

Day 7:   Admin Dashboard + Batch Optimization
         └─ Admin dashboard (Next.js), batch PTB (3→1), auto-settle

Day 8:   Demo video + Submission (Feb 8, 2026)
         └─ SUBMITTED
```

---

## Dependencies

```
US-01 zkLogin ──┬──> US-04 Balance
                │
                ├──> US-03 GPS ──┬──> US-06 Buy USDC
                │                │
                ├──> US-02 KYC ──┘
                │
                ├──> US-12 Bank Accounts ──┬──> US-07 Quick Sell
                │                          │
                │                          └──> US-08 Smart Sell
                │
                └──> US-05 Tx History

Cross-cutting:
- US-09 Navigation (all screens)
- US-10 Error Handling (all features)
- US-11 Multi-language (all UI text)
```

---

## Out of Scope (Hackathon MVP)

- Send USDC to address (P2P transfer)
- Real eKYC (FPT.AI integration)
- iOS TestFlight deployment
- Push notifications (beyond in-app)
- Advanced order types (expiry, stop-loss)
- Dispute resolution system
- Admin dashboard for Liquidity Pool

---

## Trading Model (IMPLEMENTED)

```
┌───────────────────────────────────────────────────────────┐
│  ON-RAMP (VND → USDC)           OFF-RAMP (USDC → VND)     │
│  ─────────────────────          ───────────────────────── │
│  US-06: Buy USDC                US-07: Quick Sell         │
│  - SePay VietQR payment         - Instant at market rate  │
│  - Auto convert via contract    - Fee: 0.5%               │
│  - Fee: 0.5%                    - VND auto-disbursed      │
│                                                           │
│                                 US-08: Smart Sell         │
│                                 - Set target rate (±10%)  │
│                                 - Fee: 0.2% (60% off)     │
│                                 - Escrow-based, partial   │
│                                 - Batch PTB optimization  │
│                                 - Auto-settle on complete │
└───────────────────────────────────────────────────────────┘

PREREQUISITES:
- US-03: Location verified (Da Nang, 500m radius)
- US-02: Mock KYC passed (auto-approve)
- US-12: Bank account saved (encrypted AES-256)

LIQUIDITY POOL & ORACLE:
- Platform pre-funded USDC on Sui Testnet
- Smart Sell orders add liquidity
- Separate buy_rate and sell_rate (50 bps spread)
- Rate updates every 5 minutes (exchange-api)
- Order matching: price-time priority (best rate first)
```

---

## Decisions (IMPLEMENTED)

| Topic | Decision |
|-------|----------|
| Smart Sell Escrow | On-chain (Move smart contract with shared escrow objects) |
| VND Transfer Out | Auto via SePay production API disbursement |
| VND Balance Storage | None - direct conversion only |
| Bank Account | Save & manage with AES-256 encryption |
| Geographic Restriction | Da Nang sandbox (10.7769°N, 106.6669°E), 500m radius |
| Language Support | Vietnamese + English with i18n |
| Transaction Limits | None for MVP |
| Price Feed | exchange-api (free, replaced CoinGecko) |
| Oracle Rates | Separate buy_rate and sell_rate (50 bps spread) |
| Rate Updates | Every 5 minutes via cron job |
| Empty Pool | Block trades, show "Temporarily out of liquidity" |
| GPS Denied | View balance OK, block Buy/Sell until granted |
| Bank Transfer Fail | Flag for admin, manual review |
| Order Matching | Price-time priority (best rate first) |
| Target Rate Range | ±10% from current market rate |
| Home Screen | Balance + Recent txns + Quick actions (Buy/Sell) |
| QR Expiry Transfer | Manual review (after 15min) |
| Partial Fill Notify | In-app notification on each fill |
| Batch PTB | 3 smart sell fills + pool dispense → 1 PTB |
| Auto-Settle | Fully filled smart sell orders settle automatically |
| Key Storage | expo-secure-store for zkLogin private keys |

---

## Implementation Complete

All questions resolved through implementation:

- **SePay** - Using production API with webhook integration for real bank transfers
- **USDC Liquidity** - Platform-funded pool deployed on Sui Testnet
- **Key Storage** - expo-secure-store proven secure for zkLogin private keys
- **Rate Updates** - Cron job fetches every 5 minutes (optimal for UX + cost)
- **GPS Locations** - Da Nang city center with 500m sandbox radius configured
- **Admin Dashboard** - Implemented (was out-of-scope), provides order/user/analytics views
- **Batch Optimization** - 3 smart sell fills + pool dispense combined into 1 PTB for gas savings
- **Auto-Settle** - Fully filled smart sell orders automatically settle without user action
