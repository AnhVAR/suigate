# SuiGate MVP - User Stories

**Scope:** MVP for 8-day hackathon (ETHGlobal HackMoney 2026)
**Format:** Standard (As a... I want... So that...)
**Last Updated:** 2026-01-30

---

## Epic 1: Authentication & Onboarding

### US-01: zkLogin Registration
> As a **Vietnamese crypto beginner**,
> I want to **create a wallet using my Google/Apple account**,
> So that **I don't need to manage seed phrases or private keys**.

**Acceptance Criteria:**
- [ ] OAuth flow works with Google/Apple
- [ ] Wallet address auto-generated after login
- [ ] No seed phrase displayed to user
- [ ] Session persists on app restart

**Priority:** P1 | **Effort:** High | **Risk:** High

---

### US-02: Mock KYC Verification
> As a **new user**,
> I want to **complete identity verification quickly**,
> So that **I can access VND conversion features**.

**Acceptance Criteria:**
- [ ] Mock KYC UI flow (auto-approve for demo)
- [ ] "Verified" status stored in Supabase
- [ ] Block VND features if not KYC verified
- [ ] Display note: "Mock - FPT.AI integration planned"

**Priority:** P2 | **Effort:** Low | **Risk:** Low

---

### US-03: Location Verification
> As a **Vietnamese user**,
> I want to **verify I'm in the sandbox zone**,
> So that **I can access VND conversion features legally**.

**Acceptance Criteria:**
- [ ] Request GPS permission on first launch
- [ ] Check if user within allowed boundary (500m radius from specific locations)
- [ ] Block VND features (Buy/Sell) if outside zone
- [ ] GPS denied: can view balance, block trading with GPS prompt
- [ ] Show clear message explaining geographic restriction
- [ ] Allow retry location check
- [ ] Cache location status (re-verify on app restart)

**Priority:** P2 | **Effort:** Medium | **Risk:** Low

**Note:** Phase 1 sandbox - 500m radius from specific locations (TBD: event venues, partner stores).

---

## Epic 2: Wallet Core

### US-04: View USDC Balance
> As a **wallet user**,
> I want to **see my USDC balance on the home screen**,
> So that **I know how much crypto I have available**.

**Acceptance Criteria:**
- [ ] Fetch balance from Sui RPC
- [ ] Pull-to-refresh functionality
- [ ] Loading state while fetching
- [ ] Error state on network failure
- [ ] Home screen: Balance + Recent transactions + Quick actions (Buy/Sell)
- [ ] VND equivalent display (using current rate)

**Priority:** P1 | **Effort:** Low | **Risk:** Low

---

### US-05: Transaction History
> As a **wallet user**,
> I want to **view my past transactions**,
> So that **I can track my activity**.

**Acceptance Criteria:**
- [ ] List transactions chronologically (newest first)
- [ ] Display: type, amount, status, timestamp
- [ ] Filter by type (buy, quick_sell, smart_sell)
- [ ] Empty state when no transactions
- [ ] Smart Sell orders show fill progress (e.g., "70/100 USDC filled")

**Priority:** P2 | **Effort:** Medium | **Risk:** Low

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
- [ ] Input VND amount (min 50,000 VND)
- [ ] Display exchange rate (Binance/CoinGecko) + USDC preview
- [ ] Generate SePay VietQR with amount + unique reference
- [ ] Countdown timer for QR (15 min expiry)
- [ ] Webhook receives transfer notification
- [ ] Auto-convert VND → USDC via smart contract
- [ ] USDC credited to user wallet
- [ ] Transaction recorded in history
- [ ] Success/timeout notification
- [ ] Late transfer (after expiry) → manual review

**Priority:** P2 | **Effort:** High | **Risk:** High

**Note:** No VND balance stored. VND in = USDC out immediately.

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
- [ ] Input USDC amount to sell
- [ ] Display current rate (Binance/CoinGecko) + VND output (after 0.5% fee)
- [ ] Select bank account from saved list (or add new)
- [ ] Match with platform Liquidity Pool
- [ ] Auto VND bank transfer (via SePay disbursement)
- [ ] Transaction record + status tracking
- [ ] Show "Temporarily out of liquidity" if pool insufficient
- [ ] Transfer fail → flag for manual review, notify user

**Priority:** P2 | **Effort:** High | **Risk:** Medium

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
- [ ] Input USDC amount + target VND rate
- [ ] Target rate validation: ±10% from current market rate
- [ ] Show comparison: Quick Sell vs Smart Sell earnings
- [ ] Select bank account from saved list (or add new)
- [ ] USDC locked in smart contract escrow (on-chain)
- [ ] View active Smart Sell orders in "My Orders"
- [ ] Auto-execute when market rate >= target rate (best rate first)
- [ ] Partial fill support (VND auto-transferred per fill)
- [ ] Cancel order (unlock remaining USDC) anytime
- [ ] Fee: 0.2% (vs 0.5% Quick Sell)
- [ ] In-app notification on each fill

**Priority:** P2 | **Effort:** High | **Risk:** High

---

## Epic 5: Basic UI/UX

### US-09: Core Navigation
> As a **mobile user**,
> I want to **navigate between main screens easily**,
> So that **I can access all features quickly**.

**Acceptance Criteria:**
- [ ] Bottom tabs: Home, Trade, History, Settings
- [ ] Trade screen: Buy USDC / Sell USDC (Quick/Smart)
- [ ] Smooth transitions between screens
- [ ] Back button works correctly

**Priority:** P1 | **Effort:** Low | **Risk:** Low

---

### US-10: Error Handling
> As a **user**,
> I want to **see clear error messages when something fails**,
> So that **I understand what went wrong and how to fix it**.

**Acceptance Criteria:**
- [ ] Network errors show retry button
- [ ] Validation errors display inline
- [ ] Transaction failures include explanation
- [ ] No cryptic error codes

**Priority:** P1 | **Effort:** Medium | **Risk:** Low

---

### US-11: Multi-language Support (Vi/En)
> As a **Vietnamese user**,
> I want to **use the app in Vietnamese or English**,
> So that **I can understand all features in my preferred language**.

**Acceptance Criteria:**
- [ ] Default language based on device locale
- [ ] Language switcher in Settings
- [ ] All UI text translated (Vi/En)
- [ ] Number/currency formatting per locale
- [ ] Persist language preference

**Priority:** P2 | **Effort:** Medium | **Risk:** Low

---

## Epic 6: Bank Account Management

### US-12: Manage Bank Accounts
> As a **user selling USDC**,
> I want to **save and manage my bank accounts**,
> So that **I don't have to enter bank info every time**.

**Acceptance Criteria:**
- [ ] Add new bank account (bank name, account number, account holder)
- [ ] List saved bank accounts
- [ ] Select from saved accounts when selling USDC
- [ ] Edit/delete saved accounts
- [ ] Validate account number format
- [ ] Default account selection

**Priority:** P2 | **Effort:** Medium | **Risk:** Low

**Flow:**
```
User initiates sell → Check saved accounts
├── Has accounts → Show picker to select
└── No accounts → Prompt to add new → Save → Continue
```

---

## Priority Matrix

| Story | Priority | Effort | Risk | Day |
|-------|----------|--------|------|-----|
| US-01 zkLogin | P1 | High | High | 1-2 |
| US-09 Navigation | P1 | Low | Low | 1-2 |
| US-11 Multi-language | P2 | Medium | Low | 2 |
| US-03 Location GPS | P2 | Medium | Low | 2 |
| US-04 View Balance | P1 | Low | Low | 3 |
| US-12 Bank Accounts | P2 | Medium | Low | 3 |
| US-06 Buy USDC | P2 | High | High | 4 |
| US-07 Quick Sell | P2 | High | Medium | 5 |
| US-08 Smart Sell | P2 | High | High | 5 |
| US-05 Tx History | P2 | Medium | Low | 6 |
| US-02 Mock KYC | P2 | Low | Low | 6 |
| US-10 Error Handling | P1 | Medium | Low | 7 |

**Total: 12 User Stories**

---

## Implementation Order

```
Day 1-2: US-01 (zkLogin) + US-09 (Navigation) + US-11 (i18n setup)
Day 2:   US-03 (GPS) + US-02 (Mock KYC)
Day 3:   US-04 (Balance) + US-12 (Bank Accounts)
Day 4:   US-06 (Buy USDC)
Day 5:   US-07 (Quick Sell) + US-08 (Smart Sell)
Day 6:   US-05 (Tx History) + US-10 (Error handling)
Day 7:   Polish + Testing
Day 8:   Demo video + Submission
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

## Trading Model

```
┌───────────────────────────────────────────────────────────┐
│  ON-RAMP (VND → USDC)           OFF-RAMP (USDC → VND)     │
│  ─────────────────────          ───────────────────────── │
│  US-06: Buy USDC                US-07: Quick Sell         │
│  - VietQR payment               - Instant at market rate  │
│  - Auto convert                 - Fee: 0.5%               │
│  - Fee: 0.5%                    - VND to bank immediately │
│                                                           │
│                                 US-08: Smart Sell         │
│                                 - Set target rate         │
│                                 - Fee: 0.2% (60% off)     │
│                                 - Auto-sell when hit      │
│                                 - Adds to Liquidity Pool  │
└───────────────────────────────────────────────────────────┘

PREREQUISITES:
- US-03: Location verified
- US-02: Mock KYC passed
- US-12: Bank account saved (for off-ramp)

LIQUIDITY POOL (Backend):
- Platform pre-funded USDC
- Smart Sell orders contribute
- Serves Buy USDC + Quick Sell requests
```

---

## Decisions

| Topic | Decision |
|-------|----------|
| Smart Sell Escrow | On-chain (Move smart contract) |
| VND Transfer Out | Auto via SePay disbursement |
| VND Balance Storage | None - direct conversion only |
| Bank Account | Save & manage (US-12), select when selling |
| Geographic Restriction | Sandbox zone only (US-03) |
| Language Support | Vietnamese + English (US-11) |
| Transaction Limits | None for MVP |
| VND/USDC Rate | Fetch from Binance/CoinGecko API |
| Empty Liquidity Pool | Block Quick/Smart Sell, show "Temporarily out of liquidity" |
| GPS Denied | View balance OK, block Buy/Sell until GPS granted |
| Bank Transfer Fail | Manual review, flag for admin |
| Smart Sell Matching | Best rate first (lowest rate priority) |
| Smart Sell Order Limit | Unlimited active orders |
| Target Rate Range | ±10% from current market rate |
| Home Screen | Balance + Recent txns + Quick actions (Buy/Sell) |
| QR Expiry Transfer | Manual review (late transfer after 15min) |
| Partial Fill Notify | Notify user on each fill |
| GPS Boundary | 500m radius from specific locations |

---

## Open Questions

1. **SePay Sandbox** - Does SePay have a test mode?
2. **USDC Liquidity** - Where to fund testnet USDC for demo?
3. **zkLogin Key Storage** - Use expo-secure-store or alternative?
4. **Rate Update Frequency** - How often to fetch rate? (5s, 30s, 1min?)
5. **GPS Locations** - Which specific locations for 500m radius? (event venues, partner stores?)
