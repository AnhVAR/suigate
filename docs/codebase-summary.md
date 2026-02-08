# SuiGate - Codebase Summary

Complete directory structure, file organization, and technical overview.

## Monorepo Structure

```
suigate/                                    # Root monorepo
├── app/                    (77 files, 8,965 LOC)
├── backend/                (23 dirs, 5,967 LOC)
├── admin/                  (70 files)
├── contracts/              (6 files, 564 LOC)
├── packages/
│   └── shared-types/       (shared DTOs/enums)
├── oauth-proxy/            (66 LOC)
├── docs/                   (documentation)
├── plans/                  (implementation plans)
└── package.json           (npm workspaces)
```

## App Directory (Mobile - Expo 54)

**Location**: `/Users/anhnph/Downloads/Work/suigate/app`
**Tech**: React Native 0.81.5, TypeScript, Zustand, Expo Router, NativeWind
**Size**: 77 TypeScript/TSX files, 8,965 LOC
**Build**: EAS Build, development client required for native modules

### Directory Structure

```
app/
├── src/
│   ├── app/                  # Expo Router pages
│   │   ├── (tabs)/           # Bottom tab navigation
│   │   │   ├── index.tsx     # Wallet home screen
│   │   │   ├── convert.tsx   # Buy/Sell conversion screen
│   │   │   ├── history.tsx   # Transaction history
│   │   │   └── settings.tsx  # Settings & language
│   │   ├── login/            # OAuth login flow
│   │   ├── kyc-verification/ # Mock KYC screen
│   │   ├── location-check/   # GPS permission & verification
│   │   ├── oauth-callback/   # OAuth redirect handler
│   │   └── _layout.tsx       # Root navigation layout
│   │
│   ├── components/
│   │   ├── ui/               # Basic UI components
│   │   ├── wallet-display/   # Balance & address display
│   │   ├── conversion-input/ # Amount input with validation
│   │   ├── order-list/       # Transaction list view
│   │   └── error-boundary/   # Error handling UI
│   │
│   ├── services/
│   │   ├── sui-wallet-service.ts      # Wallet address derivation & txn signing
│   │   ├── trading-service.ts         # Buy/Sell order API calls
│   │   ├── zklogin/                   # 8 sub-services for OAuth flow
│   │   ├── location-permission.ts     # GPS permission & location check
│   │   └── api-service.ts             # Axios HTTP client with JWT interceptors
│   │
│   ├── stores/                # Zustand state management
│   │   ├── auth-store.ts      # User, tokens, JWT
│   │   ├── wallet-store.ts    # Balance, address, USDC
│   │   ├── trading-store.ts   # Orders, conversion rates
│   │   ├── bank-accounts-store.ts # Saved bank accounts
│   │   └── global-ui-store.ts # Loading, error, modal state
│   │
│   ├── hooks/
│   │   ├── useWalletBalance.ts
│   │   ├── useConversionRate.ts
│   │   ├── useUserLocation.ts
│   │   ├── useKycStatus.ts
│   │   └── useOrderTracking.ts
│   │
│   ├── utils/
│   │   ├── currency-formatter.ts
│   │   ├── address-validator.ts
│   │   ├── error-handler.ts
│   │   └── crypto-operations.ts
│   │
│   ├── types/
│   │   └── index.ts (re-exports from shared-types)
│   │
│   ├── constants/
│   │   ├── app-config.ts
│   │   ├── api-endpoints.ts
│   │   └── error-messages.ts
│   │
│   └── App.tsx               # Root component
│
├── package.json
├── tsconfig.json
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build config
└── babel.config.js
```

### Key Dependencies
- @mysten/sui 2.1.0 - Sui SDK
- @mysten/zklogin 0.8.1 - zkLogin utilities
- zustand 5.0.10 - State management
- axios 1.13.4 - HTTP client
- i18next 25.8.0 - Multi-language support
- nativewind - Tailwind CSS for React Native
- expo 54 - Managed React Native

## Backend Directory (NestJS API)

**Location**: `/Users/anhnph/Downloads/Work/suigate/backend`
**Tech**: NestJS, TypeScript, PostgreSQL, Redis, Supabase
**Size**: 23 directories, 5,967 LOC
**Deploy**: Render.com (Singapore)

### Module Structure

```
backend/src/modules/
├── auth/
│   ├── auth.controller.ts       # POST /auth/zklogin
│   ├── auth.service.ts          # JWT generation & validation
│   ├── dto/                      # Auth DTOs
│   └── guards/                   # JWT auth guard
│
├── users/
│   ├── users.controller.ts       # GET /users/me, PATCH /users/me/*
│   ├── users.service.ts
│   ├── dto/
│   │   ├── user-profile.dto.ts
│   │   ├── kyc-update.dto.ts
│   │   └── location-update.dto.ts
│   └── entities/
│
├── orders/
│   ├── orders.controller.ts       # Order endpoints
│   ├── orders.service.ts
│   ├── order-matching-engine.service.ts    # Smart sell rate matching
│   ├── smart-sell-executor.service.ts      # Auto-execute escrow
│   ├── order-expiry-handler.service.ts     # Timeout handling
│   ├── quick-sell-deposit-checker.service.ts # Verify on-chain deposits
│   ├── dto/
│   │   ├── create-buy-order.dto.ts
│   │   ├── create-quick-sell.dto.ts
│   │   └── create-smart-sell.dto.ts
│   └── entities/
│
├── rates/
│   ├── rates.controller.ts        # GET /rates/current
│   ├── rates.service.ts           # exchange-api integration
│   ├── oracle-update.service.ts   # Push rates to Sui oracle
│   └── dto/
│
├── wallet/
│   ├── wallet.controller.ts        # GET /wallet/balance
│   ├── wallet.service.ts
│   ├── sui-client.service.ts       # Sui RPC client
│   └── dto/
│
├── webhooks/
│   ├── webhooks.controller.ts      # POST /webhooks/sepay
│   ├── webhooks.service.ts         # HMAC verification & processing
│   └── sepay-handler.service.ts    # Payment event handling
│
├── bank-accounts/
│   ├── bank-accounts.controller.ts # CRUD endpoints
│   ├── bank-accounts.service.ts
│   ├── encryption.service.ts       # AES encryption for account numbers
│   └── dto/
│
├── admin/
│   ├── admin.controller.ts
│   ├── submodules/
│   │   ├── admin-orders/           # Order management
│   │   ├── admin-users/            # User management
│   │   └── admin-analytics/        # KYC, settlement stats
│   └── dto/
│
├── common/
│   ├── guards/                      # JWT, RBAC guards
│   ├── filters/                     # Exception filters
│   ├── interceptors/                # Request/response logging
│   ├── decorators/                  # @CurrentUser, @RequireRole
│   ├── pipes/                       # Validation pipes
│   └── utils/
│
├── app.module.ts                    # Root module with all modules
├── main.ts                          # Bootstrap
└── config/                          # Environment config
```

### Key Services
- **orders.service.ts**: Core order CRUD and workflow
- **order-matching-engine.service.ts**: Smart sell rate matching (runs every 5 min)
- **smart-sell-executor.service.ts**: Executes escrow when rates hit
- **rates.service.ts**: Fetches from exchange-api (free tier)
- **sui-transaction.service.ts**: Batch PTB construction, Enoki sponsorship
- **webhooks.service.ts**: SePay webhook HMAC verification
- **vietqr-generator.service.ts**: QR code generation for payments

### Database (Supabase)
- 5 main tables: users, orders, transactions, bank_accounts, conversion_rates
- Row Level Security on all tables (users can only see own data)
- Indexes on: sui_address, user_id, order status, smart_sell orders
- ENUM types: kyc_status, order_type, order_status, tx_status

### Environment Variables
50+ config vars for:
- Supabase (URL, anon key, service role)
- Sui RPC endpoints (mainnet, testnet)
- OAuth (Google/Apple credentials)
- SePay API keys
- JWT secret
- Redis connection
- Admin dashboard URL

## Admin Dashboard (Next.js 14)

**Location**: `/Users/anhnph/Downloads/Work/suigate/admin`
**Tech**: Next.js 14, React 18, TypeScript, TanStack Query, Tailwind CSS
**Size**: 70 files (app router, components, hooks)
**Deploy**: Vercel

### Directory Structure

```
admin/
├── app/
│   ├── page.tsx                # Landing (redirects to /dashboard)
│   ├── login/
│   │   └── page.tsx            # OAuth login + zkLogin auth
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard overview
│   │   ├── orders/
│   │   │   ├── page.tsx        # Order list with filters
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Order detail & actions
│   │   ├── users/
│   │   │   └── page.tsx        # User management
│   │   └── analytics/
│   │       └── page.tsx        # KYC, volume, settlement stats
│   └── layout.tsx              # Root layout
│
├── components/
│   ├── dashboard/              # Dashboard layouts
│   ├── orders/                 # Order table, filters, detail modal
│   ├── users/                  # User table, status badge
│   ├── analytics/              # Charts (Recharts), stats cards
│   ├── sidebar/                # Navigation sidebar
│   └── common/                 # Loading, pagination, etc
│
├── hooks/
│   ├── useOrders.ts            # TanStack Query for orders
│   ├── useUsers.ts             # TanStack Query for users
│   ├── useAuth.ts              # Auth state management
│   └── useAnalytics.ts         # Analytics data fetching
│
├── lib/
│   ├── api-client.ts           # Fetch wrapper with Bearer token
│   ├── auth.ts                 # zkLogin + JWT cookie handling
│   └── utils.ts
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

### Key Features
- Real-time order management (list, detail, approve, settle, cancel)
- User admin panel (KYC status, location verification)
- Analytics dashboard (volume, settlement, failed transfers)
- Manual review queue for flagged orders
- Multi-user RBAC (admin/support roles)
- Deployed on Vercel with auto-deploy from main branch

## Contracts Directory (Move)

**Location**: `/Users/anhnph/Downloads/Work/suigate/contracts`
**Tech**: Sui Move, TypeScript (for tests)
**Size**: 6 files, 564 LOC, 11/11 tests passing
**Network**: Sui Testnet
**Package ID**: 0xa0293d10661a51dadbed27335bb79de99f572a0e216502ffb39865312b92d828

### Move Modules

```
contracts/sources/
├── admin_cap.move (20 LOC)
│   ├── AdminCap struct          # Single admin capability
│   └── init()                    # Creates AdminCap once
│
├── price_oracle.move (132 LOC)
│   ├── PriceOracle struct       # buy_rate, sell_rate, mid_rate
│   ├── update_rates()           # Admin updates (from backend)
│   ├── get_buy_rate()           # With staleness check
│   ├── get_sell_rate()          # With staleness check
│   └── const MAX_STALENESS_MS   # 10 minutes
│
├── liquidity_pool.move (175 LOC)
│   ├── LiquidityPool struct     # usdc_reserve, total_volume
│   ├── add_liquidity()          # Admin only
│   ├── withdraw_liquidity()     # Admin only
│   ├── dispense_usdc()          # Public (for buy orders)
│   └── deposit_usdc()           # Public (for quick sell)
│
├── escrow.move (207 LOC)
│   ├── Escrow struct (shared)   # owner, usdc_balance, target_rate
│   ├── create_escrow()          # User creates order
│   ├── cancel_escrow()          # Owner cancels, gets USDC back
│   ├── execute_escrow()         # Admin executes when rate hit
│   ├── partial_fill()           # Admin partial execution with buy_rate
│   └── Errors: E_INVALID_AMOUNT, E_RATE_NOT_MET, etc
│
├── test_usdc.move (90 LOC)
│   ├── USDC mint                # Test token for testnet only
│   └── init()                    # Create test coins
│
└── tests/
    ├── escrow_tests.move        # 6 test functions
    ├── suigate_tests.move       # 5 test functions
    └── All passing (11/11)
```

### Test Coverage
- create_escrow success
- cancel_escrow success
- execute_escrow when rate >= target
- partial_fill with buy_rate adjustment
- Error cases (invalid amount, rate not met, unauthorized)
- Pool operations (add, dispense, deposit)

### Key Implementation Details

**Rate Calculation:**
```
mid_rate = 25,000 VND/USDC (from exchange-api)
spread = 0.5% (50 bps)

buy_rate  = 25,000 × 1.0025 = 25,062.50 VND  (user pays more)
sell_rate = 25,000 × 0.9975 = 24,937.50 VND  (user receives less)
```

**Batch PTB Optimization:**
- Single transaction bundles: oracle update + escrow execution + pool dispense
- Reduces on-chain operations from 3 txns to 1
- Prevents stale oracle reads between operations
- Saves ~66% on gas fees

**Escrow State:**
- Shared object pattern for concurrent access
- Partial fills supported (admin can fill part of order)
- Each fill applies current buy_rate for accurate settlement
- Auto-settle when fully filled (100% of amount_usdc)

## Shared Types Package

**Location**: `/Users/anhnph/Downloads/Work/suigate/packages/shared-types`
**Tech**: TypeScript
**Purpose**: Single source of truth for DTOs, enums, types across monorepo

### Contents
- **DTOs**: auth, user, wallet, rates, bank-account, orders
- **Enums**: KycStatus, OrderType, OrderStatus, AuthProvider, TransferType
- **Types**: Wallet, Transaction, Order, ConversionRate
- **Validators**: Class-validator decorators for NestJS
- **Build**: TypeScript compiled to dist/, imported by app/backend/admin

## OAuth Proxy

**Location**: `/Users/anhnph/Downloads/Work/suigate/oauth-proxy`
**Tech**: Vercel serverless, TypeScript
**Size**: 66 LOC
**Purpose**: OAuth callback handler that redirects to mobile app with JWT

### Endpoint
```
GET /api/callback?id_token=<JWT>
Redirects to: suigate://oauth#id_token=<JWT>
```

## Documentation Files

```
docs/
├── project-overview-pdr.md         # Vision, features, PDR
├── codebase-summary.md             # This file
├── code-standards.md               # Naming, patterns, conventions
├── system-architecture.md          # Flows, integrations, DB schema
├── project-roadmap.md              # 8-day timeline with status
├── user-stories.md                 # 12 user stories with acceptance criteria
├── requirements-scope.md           # Functional/non-functional specs
├── smart-contracts-audit-report.md # Audit findings (Jan 31)
└── code-reviews/                   # Review snapshots
```

## Key Statistics

| Component | Files | LOC | Tech |
|-----------|-------|-----|------|
| Mobile (app) | 77 | 8,965 | React Native, TypeScript |
| Backend | 23 dirs | 5,967 | NestJS, PostgreSQL |
| Admin | 70 | ~3,500 | Next.js 14, React 18 |
| Contracts | 6 | 564 | Move, 11 tests |
| Total | ~170 | ~19,000 | Monorepo |

## Build & Test Commands

```bash
# Root
npm install                    # Install all workspaces
npm run build                  # Build all packages

# App
cd app
npx expo start --dev-client    # Start dev server
npx expo run:android           # Build dev client

# Backend
cd backend
npm run start:dev              # Dev server with hot reload
npm run build                  # Production build
npm test                       # Run unit tests

# Admin
cd admin
npm run dev                    # Next.js dev server (localhost:3000)
npm run build                  # Production build

# Contracts
cd contracts
sui move build                 # Build packages
sui move test                  # Run all tests (11/11)
sui move publish               # Deploy to testnet
```

## Deployment Overview

| Component | Platform | Region | Trigger |
|-----------|----------|--------|---------|
| App | EAS Build | Global | Manual for APK |
| Backend | Render.com | Singapore | Auto on main push |
| Admin | Vercel | Global CDN | Auto on main push |
| Contracts | Sui Testnet | Public | Manual deployment |
| Database | Supabase | us-east-1 | N/A (managed) |

## Development Workflow

1. **Local Development**: npm workspaces with shared-types symlink
2. **Testing**: Backend unit tests + Move contract tests (11/11 passing)
3. **Code Review**: PR required, lint checks, type safety
4. **Deployment**: Automated on main branch merge (backend, admin)
5. **Mobile**: Manual EAS build or local dev client
6. **Contracts**: Manual publish to testnet

---

**Last Updated**: 2026-02-07 | **Status**: Fully implemented (Day 8)
