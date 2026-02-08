# SuiGate - Mobile Wallet for Vietnam Crypto Market

Mobile wallet enabling VND ↔ USDC conversion on Sui, targeting Vietnam's newly legalized crypto market.

## Vision

Frictionless crypto onboarding for Vietnamese users through:
- Seedless wallet creation (zkLogin via Google/Apple OAuth)
- eKYC verification for regulatory compliance
- VND ↔ USDC conversion at market rates
- Gasless transactions via sponsored operations

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Mobile** | Expo 54 + React Native 0.81.5 + TypeScript | Cross-platform iOS/Android |
| **Backend** | NestJS + PostgreSQL + Supabase | Auth, orders, rates, webhooks |
| **Admin** | Next.js 14 + React 18 + Tailwind | Orders, users, analytics dashboards |
| **Blockchain** | Sui Network + Move | zkLogin native, 5 modules |
| **Auth** | Sui zkLogin + OAuth | 24hr ephemeral keypairs |
| **Payment** | SePay (VietQR) | Vietnamese bank transfers |
| **Rates** | exchange-api (free) | VND/USDC pricing feed |
| **Deployment** | Render.com + Vercel | Backend Singapore, admin global |

## Core Features (Implemented)

**Authentication & Onboarding:**
- zkLogin wallet creation (Google/Apple OAuth)
- Mock eKYC verification (auto-approve)
- GPS location check (Da Nang sandbox validation)

**Wallet & Transactions:**
- USDC balance display + VND equivalent
- Buy USDC via VietQR bank transfer (0.5% fee)
- Quick Sell (instant at market rate, 0.5% fee)
- Smart Sell (set target rate, auto-execute, 0.2% fee)
- Transaction history with filtering
- Bank account management

**Admin Features:**
- Order management dashboard (buy, quick-sell, smart-sell)
- User analytics (KYC status, location verification)
- Settlement tracking and manual review queue

**Developer Experience:**
- Centralized shared-types package for DTOs
- OAuth proxy (Vercel serverless)
- Comprehensive error handling & logging
- Multi-language UI (Vietnamese + English)

## Getting Started

### Mobile App
```bash
cd app
npm install
npx expo start --dev-client      # Dev client mode (required for native modules)
npx expo run:android             # Build development client
```

### Backend API
```bash
cd backend
npm install
npm run start:dev
# Requires: Supabase, SePay credentials, Sui RPC
```

### Admin Dashboard
```bash
cd admin
npm install
npm run dev
# Navigate to http://localhost:3000
```

### Smart Contracts
```bash
cd contracts
sui move build
sui move test
# Deploy to Sui testnet
```

## Project Structure

```
suigate/
├── app/                      # Expo React Native mobile (8,965 LOC)
│   ├── src/
│   │   ├── screens/          # Expo Router pages
│   │   ├── components/       # Reusable UI components
│   │   ├── services/         # Business logic & APIs
│   │   ├── hooks/            # Custom React hooks
│   │   └── stores/           # Zustand state management
│   └── package.json
│
├── backend/                  # NestJS REST API (5,967 LOC)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # JWT auth, zkLogin
│   │   │   ├── orders/       # Order management
│   │   │   ├── admin/        # Admin submodules
│   │   │   ├── rates/        # Exchange rate service
│   │   │   ├── users/        # User profiles
│   │   │   ├── wallet/       # USDC balance queries
│   │   │   ├── webhooks/     # SePay integration
│   │   │   └── bank-accounts/# Bank account management
│   │   └── common/           # Guards, filters, utils
│   └── package.json
│
├── admin/                    # Next.js 14 admin dashboard (70 files)
│   ├── app/                  # App router pages
│   ├── components/           # Radix UI + shadcn/ui
│   ├── hooks/                # TanStack Query
│   └── package.json
│
├── contracts/                # Sui Move smart contracts (564 LOC)
│   ├── sources/
│   │   ├── admin_cap.move    # Capability pattern
│   │   ├── price_oracle.move # Buy/sell rates + staleness check
│   │   ├── liquidity_pool.move # Platform USDC reserve
│   │   ├── escrow.move       # Smart sell escrow
│   │   └── test_usdc.move    # Testnet USDC
│   └── Move.toml
│
├── packages/shared-types/    # TypeScript DTOs & enums
│   └── src/
│       ├── types/
│       └── enums/
│
├── oauth-proxy/              # Vercel serverless OAuth (66 LOC)
│   └── api/callback.ts       # OAuth redirect handler
│
├── docs/                     # Documentation
│   ├── project-overview-pdr.md
│   ├── codebase-summary.md
│   ├── code-standards.md
│   ├── system-architecture.md
│   ├── project-roadmap.md
│   ├── user-stories.md
│   └── requirements-scope.md
│
├── plans/                    # Implementation plans & reports
├── CLAUDE.md                 # AI assistant instructions
└── AI_USAGE.md              # AI assistance tracking
```

## Architecture Highlights

**Monorepo Structure:** npm workspaces for shared code and types
- Shared DTOs and enums across mobile, backend, and admin
- Centralized validation rules
- Single source of truth for API contracts

**Smart Contracts:** 5 Move modules deployed on Sui Testnet
- Admin capability pattern for privileged operations
- Price oracle with 10-minute staleness check
- Platform liquidity pool for quick settlement
- Escrow smart contract for smart sell orders
- Batch PTB optimization for cost-efficient transactions

**Backend Architecture:** NestJS with modular design
- Supabase PostgreSQL with Row Level Security
- Redis queue for async jobs (order matching, rate updates)
- SePay integration for Vietnamese bank transfers
- Automated order matching engine for smart sell fills
- Webhook handlers for payment notifications

**Admin Dashboard:** Real-time operations center
- Order management (approve, settle, cancel)
- User analytics (KYC, location, volume)
- Settlement history and manual review queue
- Multi-user RBAC (admin/support roles)

## Key Technical Solutions

**VND Oracle:** Free exchange-api replaces CoinGecko, reducing costs while maintaining accuracy

**Gasless UX:** Sui Enoki sponsorship for seamless user experience

**Regulatory Compliance:** GPS geofencing + eKYC prevents unauthorized geographic access

**Rate Optimization:** Batch PTB bundles oracle updates + escrow execution + pool transfers

## Hackathon Details

**Event**: ETHGlobal HackMoney 2026
**Timeline**: Jan 30 - Feb 8, 2026 (8 days)
**Team**: Solo
**Stake**: 0.005 ETH

**Submission Requirements:**
- Demo video (2-4 min, 720p+)
- Full GitHub commit history
- AI_USAGE.md documenting all AI assistance
- Complete codebase with no pre-existing code

**Current Status:** Day 8 - Final testing, demo video preparation

## Documentation

See `/docs` for detailed guides:
- **[Project Overview & PDR](/docs/project-overview-pdr.md)** - Vision, architecture, compliance
- **[Codebase Summary](/docs/codebase-summary.md)** - Directory structure & file organization
- **[Code Standards](/docs/code-standards.md)** - Development conventions & naming
- **[System Architecture](/docs/system-architecture.md)** - Technical design, flows, integrations
- **[Project Roadmap](/docs/project-roadmap.md)** - 8-day timeline & milestones
- **[User Stories](/docs/user-stories.md)** - Feature requirements & acceptance criteria
- **[Requirements & Scope](/docs/requirements-scope.md)** - Functional & non-functional specs

## License

Solo hackathon project for ETHGlobal HackMoney 2026.
