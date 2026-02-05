# AI Usage Documentation

**Project:** Suigate
**Event:** ETHGlobal HackMoney 2026
**Purpose:** Document all AI tool assistance per ETHGlobal requirements

## Usage Log

| Date | Tool | File/Section | Description |
|------|------|--------------|-------------|
| 2026-01-30 | Claude Code | CLAUDE.md | Added ETHGlobal compliance rules section |
| 2026-01-30 | Claude Code | AI_USAGE.md | Created AI usage tracking template |
| 2026-01-31 | Claude Code | docs/user-stories.md | Structured 12 user stories with acceptance criteria |
| 2026-01-31 | Claude Code | docs/requirements-scope.md | Created tech stack and scope documentation |
| 2026-01-31 | Claude Code | plans/260131-0707-system-architecture-mvp/ | Created architecture plan with 6 phases |
| 2026-01-31 | Claude Code | docs/system-architecture.md | Consolidated system architecture documentation |
| 2026-01-31 | Claude Code | docs/system-architecture.md | Updated: platform-funded LP for MVP, added price oracle pattern |
| 2026-01-31 | Claude Code | plans/260131-0707-*/plan.md | Updated validation decisions: LP deferred, oracle roadmap |
| 2026-01-31 | Claude Code | docs/system-architecture.md | Fixed: Quick Sell flow, oracle staleness, idempotency, expires_at |
| 2026-01-31 | Claude Code | docs/project-roadmap.md | Deleted: outdated, replaced by plans/ directory |
| 2026-01-31 | Claude Code | app/src/services/trading-service.ts | Created mock trading service (rate, buy, sell orders) |
| 2026-01-31 | Claude Code | app/src/stores/trading-store.ts | Created Zustand store for trading state |
| 2026-01-31 | Claude Code | app/src/components/trading/*.tsx | Created 4 trading components (rate, bank picker, QR, fees) |
| 2026-01-31 | Claude Code | app/app/(tabs)/convert.tsx | Implemented full Buy/QuickSell/SmartSell trading UI |
| 2026-01-31 | Claude Code | app/src/i18n/* | Created i18n setup with i18next, expo-localization |
| 2026-01-31 | Claude Code | app/src/i18n/locales/*.json | Created En/Vi translation files for all UI text |
| 2026-01-31 | Claude Code | app/src/components/error/*.tsx | Created NetworkError, InlineError, ErrorBoundary components |
| 2026-01-31 | Claude Code | app/src/utils/format-*.ts | Created currency and date formatting utilities |
| 2026-01-31 | Claude Code | app/app/(tabs)/settings.tsx | Integrated i18n language toggle with persistence |
| 2026-01-31 | Claude Code | contracts/Move.toml | Created Move project config with Sui testnet framework |
| 2026-01-31 | Claude Code | contracts/sources/admin_cap.move | Created AdminCap capability pattern for access control |
| 2026-01-31 | Claude Code | contracts/sources/price_oracle.move | Created VND/USDC on-chain oracle with staleness check |
| 2026-01-31 | Claude Code | contracts/sources/liquidity_pool.move | Created platform USDC reserve with add/dispense/deposit |
| 2026-01-31 | Claude Code | contracts/sources/escrow.move | Created Smart Sell escrow with target rate execution |
| 2026-01-31 | Claude Code | contracts/tests/suigate_tests.move | Created 11 integration tests covering all modules |
| 2026-01-31 | Claude Code | contracts/DEPLOYMENT.md | Documented testnet deployment (Package ID, Object IDs) |
| 2026-02-05 | Claude Code | backend/src/common/sui/sui-transaction.service.ts | Refactored sponsor tx: added sponsorTransactionKind() per Sui docs |
| 2026-02-05 | Claude Code | backend/src/modules/wallet/wallet.controller.ts | Added POST /wallet/sponsor-tx-kind endpoint |
| 2026-02-05 | Claude Code | app/src/services/sui-wallet-service.ts | Refactored: app builds tx locally, backend sponsors |

## Guidelines

- Log every AI interaction that contributes to codebase
- Be specific about files and code sections affected
- AI assists development, does not generate entire features
- All AI output reviewed and understood by human developer
