# Codebase Summary - SuiGate Project

## Current State

Fresh project initialization for ETHGlobal HackMoney 2026. Core directories created, no implementation yet.

## Project Structure

```
suigate/
├── .claude/                      # Claude Code configuration
│   ├── rules/                    # Development rules & workflows
│   ├── skills/                   # Reusable AI skill scripts
│   └── scripts/                  # Validation & utility scripts
│
├── docs/                         # Project documentation
│   ├── project-overview-pdr.md         # Vision & requirements
│   ├── codebase-summary.md            # This file
│   ├── code-standards.md              # Dev conventions
│   ├── system-architecture.md         # Technical design
│   └── project-roadmap.md             # Hackathon timeline
│
├── plans/                        # Implementation planning
│   └── reports/                  # Agent reports & analysis
│
├── app/                          # Mobile application (TODO)
│   ├── src/
│   │   ├── components/           # React Native components
│   │   ├── screens/              # App screens/pages
│   │   ├── services/             # Business logic services
│   │   ├── hooks/                # Custom React hooks
│   │   ├── utils/                # Utility functions
│   │   ├── types/                # TypeScript types
│   │   ├── constants/            # App constants
│   │   └── App.tsx               # Root component
│   ├── app.json                  # Expo configuration
│   ├── tsconfig.json             # TypeScript config
│   └── package.json              # Dependencies
│
├── contracts/                    # Sui Move smart contracts (TODO)
│   ├── sources/
│   │   ├── vnd_usdc.move         # VND↔USDC conversion logic
│   │   ├── oracle.move           # Price oracle module
│   │   ├── sponsored_txn.move    # Sponsored transaction handler
│   │   └── zklogin.move          # zkLogin integration
│   ├── Move.toml                 # Package manifest
│   └── tests/                    # Move unit tests
│
├── README.md                     # Project overview
├── CLAUDE.md                     # AI assistant instructions
├── AI_USAGE.md                   # AI assistance tracking
└── .gitignore                    # Git ignore rules
```

## Key Directories

### `/app` - Mobile Application
Expo-based React Native application for iOS and Android.

**Purpose**: User-facing wallet interface
**Tech**: React Native, TypeScript, Expo SDK
**Status**: Not started

**Expected Subdirectories**:
- `components/` - Reusable UI components (buttons, modals, forms)
- `screens/` - Full app screens (wallet, conversion, profile, settings)
- `services/` - Business logic (Sui RPC calls, eKYC integration, GPS checks)
- `hooks/` - Custom React hooks (wallet state, conversion rates, auth)
- `utils/` - Helper functions (formatting, validation, crypto operations)
- `types/` - TypeScript interfaces and types

### `/contracts` - Smart Contracts
Sui Move smart contracts for on-chain operations.

**Purpose**: VND↔USDC conversion logic, price oracle, sponsored transactions
**Tech**: Sui Move language
**Status**: Not started

**Expected Modules**:
- `vnd_usdc.move` - Core conversion contract
- `oracle.move` - Custom VND price oracle
- `sponsored_txn.move` - Sponsored transaction handler
- `zklogin.move` - zkLogin integration wrapper

### `/docs` - Documentation
Living documentation for developers and stakeholders.

**Current Files**:
- `project-overview-pdr.md` - Vision, features, compliance requirements
- `codebase-summary.md` - This file
- `code-standards.md` - Development conventions
- `system-architecture.md` - Technical design & data flows
- `project-roadmap.md` - Hackathon timeline & milestones

### `/plans` - Implementation Plans
Sequential development plans with phases, tasks, and decision records.

**Structure**:
- `reports/` - Agent analysis reports (research, scouting, reviews)
- Phase-based markdown files for detailed implementation guidance

## Technology Stack Reference

| Component | Technology | Version |
|-----------|-----------|---------|
| Mobile Framework | Expo | Latest |
| Mobile Language | React Native + TypeScript | Latest |
| Blockchain | Sui Network | Latest |
| Smart Contract Language | Move | Latest |
| Package Manager (App) | npm/yarn | - |
| Package Manager (Contracts) | Sui CLI | - |

## Development Phases (8-day sprint)

1. **Setup** (Day 1) - Project initialization, environment setup
2. **Smart Contracts** (Days 2-3) - Move contracts for conversion & oracle
3. **Mobile App Foundation** (Days 3-4) - Navigation, auth screens, wallet setup
4. **Integrations** (Days 5-6) - zkLogin, eKYC, GPS, Sui RPC integration
5. **Features** (Days 6-7) - Conversion, transactions, history
6. **Testing & Polish** (Day 8) - QA, bug fixes, demo preparation

## Code Conventions

**File Naming**: kebab-case with descriptive names
- Good: `price-oracle-service.ts`, `conversion-modal.tsx`
- Bad: `service.ts`, `modal.tsx`

**Component Naming**: PascalCase
- Good: `TransactionHistory.tsx`, `ConversionForm.tsx`
- Bad: `transactionHistory.tsx`

**Type Naming**: PascalCase with suffix
- Good: `UserProfile`, `ConversionRequest`, `WalletState`

**Move Conventions**: snake_case
- Good: `vnd_to_usdc`, `get_price_feed`
- Bad: `vndToUsdc`

See `code-standards.md` for detailed conventions.

## Known Dependencies

**Mobile App**:
- React Native Sui Wallet SDK
- eKYC verification service (TBD)
- GPS/location library
- HTTP client (axios/fetch)

**Smart Contracts**:
- Sui framework
- USDC token contract
- Price oracle service

**Development Tools**:
- Node.js 18+
- Sui CLI
- TypeScript
- Expo CLI

## Development Workflow

1. Read implementation plan from `/plans`
2. Follow code standards in `code-standards.md`
3. Verify system architecture in `system-architecture.md`
4. Implement feature following modular structure
5. Write tests (unit & integration)
6. Update documentation as needed
7. Commit with conventional commit messages

## Next Steps

1. Initialize Expo project in `/app`
2. Initialize Sui Move project in `/contracts`
3. Set up TypeScript configuration
4. Create initial project structure
5. Begin implementation following `/plans` phases
