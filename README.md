# SuiGate - Mobile Wallet for Vietnam Crypto Market

Mobile wallet enabling VND ↔ USDC conversion on Sui, targeting Vietnam's newly legalized crypto market.

## Vision

Frictionless crypto onboarding for Vietnamese users through:
- Seedless wallet creation (zkLogin via Google/Apple OAuth)
- eKYC verification for regulatory compliance
- VND ↔ USDC conversion at market rates
- Gasless transactions via sponsored operations

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | Expo (React Native) - iOS/Android cross-platform |
| Blockchain | Sui Network + Move smart contracts |
| Stablecoin | Native USDC on Sui |
| Auth | Sui zkLogin with OAuth integration |

## Core Features

**MVP (8-day hackathon sprint):**
- zkLogin wallet creation (Google/Apple)
- eKYC identity verification
- GPS location check (Da Nang sandbox)
- VND ↔ USDC conversion
- USDC send/receive
- Transaction history

**Stretch Goals:**
- Bank transfer integration for VND deposit
- QR code scanning for peer transfers
- Transaction notifications
- Multi-language UI (Vi/En)

## Getting Started

> **Status**: In development (HackMoney 2026 sprint)

```bash
# Setup mobile app
cd app
npm install
npx expo start

# Setup smart contracts (future)
cd contracts
sui move build
```

## Project Structure

```
suigate/
├── README.md                  # This file
├── CLAUDE.md                  # AI assistant instructions
├── AI_USAGE.md               # AI assistance tracking
├── docs/                     # Documentation
│   ├── project-overview-pdr.md     # Vision & PDR
│   ├── codebase-summary.md         # Project structure
│   ├── code-standards.md           # Dev conventions
│   ├── system-architecture.md      # Technical design
│   └── project-roadmap.md          # Hackathon timeline
├── plans/                    # Implementation plans & reports
├── app/                      # Expo mobile application (TODO)
└── contracts/                # Sui Move smart contracts (TODO)
```

## Key Technical Challenges

### VND Oracle Problem
Vietnamese Dong not supported by major oracles (Pyth, Supra). Requires custom oracle solution for VND/USDC pricing.

### Gasless UX
Implemented via Sui sponsored transactions to hide gas fees from users.

### Regulatory Compliance
Geographic restriction (Da Nang sandbox phase 1) + eKYC requirements for VND features.

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

## Documentation

See `/docs` for detailed guides:
- **[Project Overview & PDR](/docs/project-overview-pdr.md)** - Vision, features, compliance
- **[Codebase Summary](/docs/codebase-summary.md)** - Project structure
- **[Code Standards](/docs/code-standards.md)** - Development conventions
- **[System Architecture](/docs/system-architecture.md)** - Technical design
- **[Project Roadmap](/docs/project-roadmap.md)** - Hackathon phases & milestones

## License

Solo hackathon project for ETHGlobal HackMoney 2026.
