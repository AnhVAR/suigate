# SuiGate - Requirements & Scope

## Overview

Mobile wallet enabling VND ↔ USDC conversion on Sui Network, targeting Vietnam's newly legalized crypto market.

**Event:** ETHGlobal HackMoney 2026
**Timeline:** Jan 30 - Feb 8, 2026 (8 days)
**Team:** Solo

---

## Core User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SUIGATE USER FLOW                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────────┐  │
│  │ Register │ → │ Mock KYC │ → │ Location │ → │ Buy USDC (VND)   │  │
│  │ zkLogin  │   │ (Auto)   │   │ GPS Check│   │ via VietQR       │  │
│  └──────────┘   └──────────┘   └──────────┘   └──────────────────┘  │
│       │                                              │              │
│       v                                              v              │
│  Google/Apple                                 ┌──────────────────┐  │
│  OAuth                                        │ USDC in Wallet   │  │
│                                               └──────────────────┘  │
│                                                      │              │
│                              ┌───────────────────────┼───────────┐  │
│                              │                       │           │  │
│                              v                       v           │  │
│                       ┌────────────┐          ┌────────────┐     │  │
│                       │ Quick Sell │          │ Smart Sell │     │  │
│                       │ (Instant)  │          │ (Set Rate) │     │  │
│                       │ Fee: 0.5%  │          │ Fee: 0.2%  │     │  │
│                       └────────────┘          └────────────┘     │  │
│                              │                       │           │  │
│                              └───────────┬───────────┘           │  │
│                                          v                       │  │
│                                   ┌────────────┐                 │  │
│                                   │ VND to Bank│                 │  │
│                                   └────────────┘                 │  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Mobile** | Expo 54 (React Native 0.81.5) + TypeScript | Cross-platform, fast iteration |
| **Backend** | NestJS 10 + TypeScript | Structured, scalable, type-safe |
| **Database** | Supabase (PostgreSQL) | Free tier, auth, realtime |
| **Blockchain** | Sui Network + Move | zkLogin native, fast finality |
| **Auth** | Sui zkLogin + expo-secure-store | No seed phrase, OAuth login |
| **Payment** | SePay (VietQR) | Vietnamese bank transfer, production API |
| **Price Feed** | exchange-api (free) | Real-time VND/USDC rate, every 5 minutes |
| **Admin** | Next.js 14 + React 18 | Dashboard (orders, users, analytics) |
| **Deploy** | Render (backend) + Vercel (admin, oauth-proxy) | Cloud, CI/CD ready |

---

## Feature Scope (12 User Stories)

### Priority 1: MUST HAVE (ALL DONE)

| US | Feature | Status |
|----|---------|--------|
| US-01 | zkLogin Wallet | DONE - Google OAuth, zkLogin, secure storage |
| US-04 | View Balance | DONE - Sui RPC balance + VND conversion |
| US-09 | Navigation | DONE - Bottom tabs (Home, Trade, History, Settings) |
| US-10 | Error Handling | DONE - Network, validation, boundary, toast errors |

### Priority 2: SHOULD HAVE (ALL DONE)

| US | Feature | Status |
|----|---------|--------|
| US-02 | Mock KYC | DONE - Auto-approve flow for demo |
| US-03 | Location Check | DONE - GPS verification (Da Nang sandbox, 500m radius) |
| US-05 | Transaction History | DONE - Chronological list with type/amount/status/filters |
| US-06 | Buy USDC | DONE - VietQR payment, webhook integration |
| US-07 | Quick Sell | DONE - Instant at market rate, 0.5% fee, auto bank transfer |
| US-08 | Smart Sell | DONE - Target rate, escrow, partial fill, auto-settle, 0.2% fee |
| US-11 | Multi-language | DONE - Vietnamese + English with locale formatting |
| US-12 | Bank Accounts | DONE - CRUD with AES-256 encryption |

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
│                                 - Set target rate (±10%)  │
│                                 - Fee: 0.2% (60% off)     │
│                                 - Auto-sell when hit      │
│                                 - Adds to Liquidity Pool  │
└───────────────────────────────────────────────────────────┘

LIQUIDITY POOL:
- Platform pre-funded USDC
- Smart Sell orders contribute liquidity
- Serves Buy USDC + Quick Sell requests
```

---

## Timeline (COMPLETED)

| Day | Focus | Status |
|-----|-------|--------|
| 1-2 | Auth & Setup | DONE - zkLogin + Navigation + i18n |
| 2 | Onboarding | DONE - GPS verification + Mock KYC |
| 3 | Wallet Core | DONE - Balance display + Bank account CRUD |
| 4 | On-Ramp | DONE - Buy USDC with SePay VietQR |
| 5 | Off-Ramp | DONE - Quick Sell + Smart Sell orders |
| 6 | History | DONE - Transaction history + Error handling |
| 7 | Admin + Batch | DONE - Admin dashboard + batch PTB optimization |
| 8 | Submit | DONE - Demo video + Submission (Feb 8) |

---

## Key Decisions (IMPLEMENTED)

| Topic | Decision |
|-------|----------|
| Price Feed | exchange-api (free, replaced CoinGecko), updates every 5 min via cron |
| Oracle Rates | Separate buy_rate and sell_rate (50 bps spread) |
| Smart Sell Escrow | On-chain (Move smart contract with shared escrow objects) |
| Batch PTB | 3 smart sell fills + pool dispense → 1 PTB (gas optimization) |
| Auto-Settle | Smart Sell orders settle automatically when fully filled |
| VND Transfer Out | Auto via SePay disbursement (production API) |
| Bank Accounts | AES-256 encrypted, CRUD enabled |
| Admin Dashboard | Implemented (orders, users, analytics) - was out-of-scope |
| Key Storage | expo-secure-store for zkLogin private keys |
| GPS Locations | Da Nang sandbox (500m radius), verified on login |
| Order Matching | Price-time priority (best rate first) |
| Empty Pool | Block trading, show clear error message |

---

## Out of Scope (Hackathon MVP)

- Send USDC to address (P2P transfer)
- Real eKYC (FPT.AI integration)
- iOS TestFlight deployment
- Push notifications (beyond in-app)
- Advanced order types (expiry, stop-loss)
- Dispute resolution system

---

## Implementation Notes

- **SePay Integration** - Production API with webhook support, auto VND disbursement
- **USDC Liquidity** - Platform-funded pool on Sui Testnet
- **zkLogin Key Storage** - expo-secure-store used for private key storage
- **Rate Updates** - Every 5 minutes via cron job (exchange-api)
- **GPS Locations** - Da Nang city center (10.7769°N, 106.6669°E) with 500m radius
- **Contract Modules** - admin_cap, price_oracle, liquidity_pool, escrow, test_usdc

---

## References

- [Sui zkLogin Docs](https://docs.sui.io/concepts/cryptography/zklogin)
- [SePay API](https://sepay.vn/docs)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [NestJS Docs](https://docs.nestjs.com/)
- [Supabase Docs](https://supabase.com/docs)
- [User Stories](./user-stories.md)
