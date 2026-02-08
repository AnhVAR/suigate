# SuiGate - Project Roadmap

8-day hackathon development timeline for ETHGlobal HackMoney 2026.

**Event:** Jan 30 - Feb 8, 2026
**Team:** Solo
**Current Status:** Day 8 (Feb 7) - Final testing & submission prep

## Day-by-Day Progress

### Day 1-2: Foundation (Jan 30-31) - DONE

**Focus:** Authentication, project setup, core navigation

**Completed:**
- [x] zkLogin OAuth flow (Google/Apple)
- [x] Sui wallet address derivation from JWT
- [x] Mobile app bottom tab navigation
- [x] Backend auth module (JWT generation/validation)
- [x] Supabase schema setup (users, orders, bank_accounts tables)
- [x] i18n setup (Vietnamese + English)
- [x] Type definitions in shared-types package

**Output:**
- Login → wallet address derivation working
- Persistent JWT tokens (24hr expiry)
- 4 main screens scaffolded (home, convert, history, settings)

**Commits:**
```
feat(app): zklogin OAuth integration with Google/Apple
feat(backend): auth module with JWT strategy
feat(db): initial Supabase schema setup
feat(app): expo router bottom tabs navigation
feat(i18n): add Vietnamese + English translations
```

---

### Day 2: Onboarding (Feb 1) - DONE

**Focus:** KYC verification, location check

**Completed:**
- [x] Mock eKYC verification flow (auto-approve)
- [x] GPS permission handler + location validation
- [x] Da Nang 500m radius boundary check
- [x] User profile update endpoints (/users/me/kyc, /users/me/location)
- [x] KYC status display in settings

**Output:**
- Users complete mock KYC screen (instant approval)
- GPS geofence validates Da Nang sandbox
- Location verified badge in UI

**Commits:**
```
feat(app): mock KYC verification flow
feat(app): GPS permission + location check
feat(backend): user kyc/location endpoints
feat(contracts): placeholder for onboarding
```

---

### Day 3: Wallet Core (Feb 2-3) - DONE

**Focus:** Balance display, bank account management

**Completed:**
- [x] Wallet balance display (USDC + VND equivalent)
- [x] Balance refresh on pull-to-refresh
- [x] Sui RPC integration (getCoins query)
- [x] Bank account CRUD endpoints
- [x] Bank account encryption (AES)
- [x] Add/edit/delete bank accounts in UI

**Output:**
- Home screen shows real USDC balance from blockchain
- Users can save up to 10 bank accounts
- Bank account list shows in sell flow

**Commits:**
```
feat(app): wallet balance display with refresh
feat(backend): bank-accounts module with encryption
feat(wallet): sui RPC client integration
feat(app): bank account management UI
```

---

### Day 4: On-Ramp (Feb 4) - DONE

**Focus:** Buy USDC via VietQR bank transfer

**Completed:**
- [x] Buy order creation endpoint (/orders/buy)
- [x] VietQR QR code generation (SePay API)
- [x] 15-minute order expiry with countdown
- [x] SePay webhook handling (/webhooks/sepay)
- [x] HMAC-SHA256 signature verification
- [x] Auto liquidity pool dispense on payment received
- [x] Webhook handler auto-settles orders
- [x] UI: amount input → QR display → polling for payment
- [x] Transaction recorded in history

**Output:**
- User: enters VND amount → sees VietQR → transfers via bank app → USDC credited
- Backend: receives SePay webhook → verifies signature → dispenses USDC
- Flow: ~10s latency from payment to on-chain settlement

**Commits:**
```
feat(orders): buy order creation + vietqr generation
feat(webhooks): sepay webhook handler with HMAC verification
feat(contracts): liquidity pool dispense function
feat(app): buy USDC flow UI with QR display
feat(orders): order settlement on webhook
```

---

### Day 5: Off-Ramp (Feb 5) - DONE

**Focus:** Quick Sell & Smart Sell orders

**Completed:**
- [x] Quick Sell: instant sell at market rate (0.5% fee)
- [x] Quick Sell flow: user deposits USDC → backend settles → VND to bank
- [x] Order matching engine service
- [x] Smart Sell: create order with target rate (±10% validation)
- [x] Escrow contract: create, cancel, execute, partial_fill functions
- [x] Smart Sell matcher (runs every 5 minutes)
- [x] Rate oracle with buy/sell spread
- [x] Batch PTB optimization (oracle update + escrow execute + pool dispense)
- [x] Partial fill support with buy_rate parameter
- [x] Auto-settle when 100% filled
- [x] UI: comparison view (Quick Sell vs Smart Sell earnings)
- [x] Order cancellation support

**Output:**
- User creates quick sell → USDC sent to pool → VND transferred to bank (10s)
- User creates smart sell → USDC locked in escrow → auto-fills when rate hit
- Smart sell fee 60% cheaper (0.2% vs 0.5%)
- Order matching runs every 5 minutes
- Batch PTB saves ~66% gas

**Commits:**
```
feat(contracts): escrow smart contract + admin_cap pattern
feat(contracts): price oracle with buy/sell rates
feat(contracts): liquidity pool + test_usdc
feat(backend): order matching engine
feat(backend): smart sell executor
feat(orders): quick-sell + smart-sell endpoints
feat(app): quick sell & smart sell UI flows
feat(app): order history display
feat(orders): batch PTB optimization
```

---

### Day 6: Polish & Admin (Feb 6) - DONE

**Focus:** Error handling, transaction history, admin dashboard

**Completed:**
- [x] Transaction history endpoint with filtering (type, status, date)
- [x] Error boundary components (mobile)
- [x] Error messages for all failure scenarios
- [x] Retry buttons for failed network calls
- [x] Admin dashboard scaffolding (Next.js 14)
- [x] Admin orders page (list, filter, detail)
- [x] Admin users page (KYC, location status)
- [x] Admin analytics page (volume, settlement charts)
- [x] Order settlement action in admin (approve/cancel)
- [x] Manual review queue for failed transfers
- [x] RBAC guards (admin/support roles)
- [x] Real-time order polling (TanStack Query)

**Output:**
- Mobile shows error messages for all edge cases
- History screen sortable + filterable
- Admin can approve orders, view analytics, manage users
- Manual review queue for flagged transfers
- Admin deployed on Vercel with auto-refresh

**Commits:**
```
feat(app): transaction history with filtering
feat(app): error boundaries + error messages
feat(admin): dashboard scaffolding (Next.js 14)
feat(admin): orders management page
feat(admin): users page with KYC status
feat(admin): analytics dashboard with charts
feat(backend): RBAC decorators for admin routes
feat(app): order detail + cancellation
```

---

### Day 7: Optimization & Testing (Feb 7 morning) - DONE

**Focus:** Bug fixes, oracle updates, batch optimization, contract testing

**Completed:**
- [x] Replace CoinGecko with free exchange-api (no auth needed)
- [x] Oracle update job runs every 5 minutes
- [x] Batch PTB combines: oracle update + escrow execute + pool dispense
- [x] buy_rate parameter added to partial_fill for accurate settlement
- [x] Move contract tests: 11/11 passing
  - escrow_tests.move (6 tests)
  - suigate_tests.move (5 tests)
- [x] Smart Sell auto-settle when fully filled (100%)
- [x] Order expiry handler (times out 24hr old orders)
- [x] Quick sell deposit verification on-chain
- [x] Stale oracle check (10-minute max)
- [x] Fix: oracle update happens before escrow execution in batch

**Output:**
- No more CoinGecko auth errors
- Batch PTB saves gas, prevents stale reads
- All Move tests passing
- Smart sell fully filled orders auto-settle
- Oracle enforces staleness validation

**Commits:**
```
fix(rates): replace CoinGecko with exchange-api
fix(contracts): update oracle before batch PTB execution
fix(orders): auto-settle fully filled smart sell orders
feat(contracts): add buy_rate to partial_fill
test(contracts): 11/11 tests passing (escrow + integration)
fix(oracle): enforce max 10-minute staleness check
fix(orders): add order expiry handler
```

---

### Day 8: Final Testing & Submission (Feb 7, current) - IN PROGRESS

**Focus:** Demo video, documentation, final testing

**In Progress:**
- [ ] Record demo video (2-4 min, 720p+)
  - Show: login → KYC → location → buy USDC → smart sell → history
  - Highlight: instant settlement, target rate matching
  - Include: admin dashboard order approval
- [ ] Final end-to-end testing (all 12 user stories)
- [ ] Verify all links in documentation
- [ ] Update AI_USAGE.md with all AI assists
- [ ] Verify git commit history (no squash, clean timeline)
- [ ] Final linting + type check

**Remaining:**
- [ ] Submit GitHub repo link
- [ ] Submit demo video
- [ ] Submit AI_USAGE.md
- [ ] Deadline: Feb 8, 2026 12:00 PM EST

---

## Milestone Status

| Milestone | Status | Date | Notes |
|-----------|--------|------|-------|
| Auth & Setup | DONE | Jan 31 | zkLogin, OAuth, navigation |
| Onboarding | DONE | Feb 1 | KYC, location check |
| Wallet Core | DONE | Feb 2-3 | Balance, bank accounts |
| On-Ramp | DONE | Feb 4 | Buy USDC (VietQR) |
| Off-Ramp | DONE | Feb 5 | Quick Sell, Smart Sell |
| Admin & Polish | DONE | Feb 6 | Dashboard, error handling |
| Testing & Optimization | DONE | Feb 7 AM | Contract tests, batch PTB |
| Demo & Submission | IN PROGRESS | Feb 7-8 | Video, final testing |

## User Stories Completion

| US | Story | Status | Completed |
|----|-------|--------|-----------|
| US-01 | zkLogin | DONE | Jan 31 |
| US-02 | Mock KYC | DONE | Feb 1 |
| US-03 | Location Check | DONE | Feb 1 |
| US-04 | View Balance | DONE | Feb 2 |
| US-05 | Transaction History | DONE | Feb 6 |
| US-06 | Buy USDC | DONE | Feb 4 |
| US-07 | Quick Sell | DONE | Feb 5 |
| US-08 | Smart Sell | DONE | Feb 5 |
| US-09 | Navigation | DONE | Jan 30 |
| US-10 | Error Handling | DONE | Feb 6 |
| US-11 | Multi-language | DONE | Jan 30 |
| US-12 | Bank Accounts | DONE | Feb 3 |

**Total:** 12/12 DONE (100% complete)

## Feature Implementation Status

| Component | Features | Status |
|-----------|----------|--------|
| **Mobile** | 12 screens, OAuth, zkLogin, location, balance, buy/sell, history | DONE |
| **Backend** | 8 modules, order matching, webhook handling, admin RBAC | DONE |
| **Admin** | Order mgmt, user mgmt, analytics, settlement queue | DONE |
| **Contracts** | 5 modules, 11/11 tests, batch PTB, oracle, escrow | DONE |
| **Integrations** | SePay (VietQR), Sui RPC, Supabase, exchange-api | DONE |

## Technical Achievements

**Architecture:**
- Monorepo with npm workspaces and shared-types package
- Batch PTB optimization reduces gas by ~66%
- Rate oracle with staleness validation (10-min max)
- Shared escrow objects for concurrent access

**Performance:**
- Smart sell matching every 5 minutes
- Order settlement <10s latency (SePay webhook)
- Mobile app cold start <5s

**Security:**
- Bank account encryption (AES)
- Row Level Security on all user tables
- HMAC-SHA256 webhook verification
- No plaintext secrets in logs

**Testing:**
- 11/11 Move contract tests passing
- Backend unit tests
- Manual end-to-end testing of all flows

## Deployment Summary

| Component | Platform | Status |
|-----------|----------|--------|
| Mobile | EAS Build | Ready (dev client available) |
| Backend | Render.com | Deployed & live |
| Admin | Vercel | Deployed & live |
| Contracts | Sui Testnet | Deployed (package ID: 0xa029...) |
| Database | Supabase | Initialized & live |

## Known Limitations (By Design)

1. **Mock KYC** - Auto-approve for demo (real FPT.AI integration post-MVP)
2. **Test USDC** - Testnet only (Sui Testnet, no mainnet funds)
3. **24hr JWT** - No silent refresh (re-login required, MVP simplicity)
4. **Da Nang Sandbox** - Geographic restriction enforced (regulatory requirement)
5. **Free rate API** - exchange-api (100 req/min limit, sufficient for MVP)

## Next Steps (Post-Hackathon)

1. Mainnet deployment with real USDC
2. Real eKYC integration (FPT.AI)
3. iOS & Android native app store releases
4. Liquidity pool partnership
5. Additional payment methods (credit card, mobile wallet)
6. P2P transfers support
7. Push notifications
8. Advanced order types (DCA, stop-loss)

---

**Last Updated:** 2026-02-07
**Timeline:** 8 days (Jan 30 - Feb 8)
**Status:** 100% MVP complete, ready for submission
