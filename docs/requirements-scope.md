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
| **Mobile** | Expo (React Native) + TypeScript | Cross-platform, fast iteration |
| **Backend** | NestJS + TypeScript | Structured, scalable, type-safe |
| **Database** | Supabase (PostgreSQL) | Free tier, auth, realtime |
| **Blockchain** | Sui Network + Move | zkLogin native, fast finality |
| **Auth** | Sui zkLogin | No seed phrase, OAuth login |
| **Payment** | SePay (VietQR) | Vietnamese bank transfer |
| **Price Feed** | Binance/CoinGecko API | Real-time VND/USDC rate |
| **Deploy** | Railway/Vercel + EAS Build | Cloud, CI/CD ready |

---

## Feature Scope (12 User Stories)

### Priority 1: MUST HAVE

| US | Feature | Description |
|----|---------|-------------|
| US-01 | zkLogin Wallet | Create wallet via Google/Apple OAuth |
| US-04 | View Balance | Display USDC balance + VND equivalent |
| US-09 | Navigation | Bottom tabs: Home, Trade, History, Settings |
| US-10 | Error Handling | Clear error messages with retry actions |

### Priority 2: SHOULD HAVE

| US | Feature | Description |
|----|---------|-------------|
| US-02 | Mock KYC | Simulated verification (auto-approve for demo) |
| US-03 | Location Check | GPS verification for sandbox zone (500m radius) |
| US-05 | Transaction History | List past transactions with filters |
| US-06 | Buy USDC | VND → USDC via VietQR bank transfer |
| US-07 | Quick Sell | Instant USDC → VND at market rate (0.5% fee) |
| US-08 | Smart Sell | Set target rate, auto-sell when hit (0.2% fee) |
| US-11 | Multi-language | Vietnamese + English support |
| US-12 | Bank Accounts | Save and manage bank accounts for off-ramp |

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

## Timeline

| Day | Focus | Deliverables |
|-----|-------|--------------|
| 1-2 | Auth & Setup | zkLogin + Navigation + i18n setup |
| 2 | Onboarding | GPS verification + Mock KYC |
| 3 | Wallet Core | Balance display + Bank account management |
| 4 | On-Ramp | Buy USDC (SePay VietQR integration) |
| 5 | Off-Ramp | Quick Sell + Smart Sell |
| 6 | History | Transaction history + Error handling |
| 7 | Polish | Testing + Bug fixes |
| 8 | Submit | Demo video + Submission |

---

## Key Decisions

| Topic | Decision |
|-------|----------|
| VND/USDC Rate | Fetch from Binance/CoinGecko API |
| Smart Sell Escrow | On-chain (Move smart contract) |
| VND Transfer Out | Auto via SePay disbursement |
| VND Balance Storage | None - direct conversion only |
| Transaction Limits | None for MVP |
| GPS Boundary | 500m radius from specific locations |
| Target Rate Range | ±10% from current market rate |
| Smart Sell Matching | Best rate first |
| Empty Pool | Block trading, show "Temporarily out of liquidity" |
| Transfer Fail | Manual review, flag for admin |

---

## Out of Scope (Hackathon)

- Send USDC to address (P2P transfer)
- Real eKYC (FPT.AI integration)
- iOS TestFlight deployment
- Push notifications (beyond in-app)
- Advanced order types (expiry, stop-loss)
- Dispute resolution system
- Admin dashboard for Liquidity Pool

---

## Open Questions

1. **SePay Sandbox** - Does SePay have a test mode?
2. **USDC Liquidity** - Where to fund testnet USDC for demo?
3. **zkLogin Key Storage** - Use expo-secure-store or alternative?
4. **Rate Update Frequency** - How often to fetch rate? (5s, 30s, 1min?)
5. **GPS Locations** - Which specific locations for 500m radius?

---

## References

- [Sui zkLogin Docs](https://docs.sui.io/concepts/cryptography/zklogin)
- [SePay API](https://sepay.vn/docs)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [NestJS Docs](https://docs.nestjs.com/)
- [Supabase Docs](https://supabase.com/docs)
- [User Stories](./user-stories.md)
