# System Architecture - SuiGate

High-level architecture and technical design for VND ↔ USDC wallet on Sui Network.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Application                       │
│                   (Expo / React Native)                     │
│                                                             │
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │ Wallet Screen    │ │ Conversion Flow  │                 │
│  │ Balance Display  │ │ Transaction UI   │                 │
│  │ Send/Receive     │ │ History View     │                 │
│  └────────┬─────────┘ └────────┬─────────┘                 │
│           │                    │                            │
│  ┌────────▼────────────────────▼─────────┐                │
│  │     Service Layer (Business Logic)     │                │
│  │  ┌─────────────────────────────────┐  │                │
│  │  │ Wallet Service                  │  │                │
│  │  │ Conversion Service              │  │                │
│  │  │ KYC Service                     │  │                │
│  │  │ Location Service                │  │                │
│  │  │ Price Oracle Service            │  │                │
│  │  └─────────────────────────────────┘  │                │
│  └────────┬─────────────────────────────┘                 │
│           │                                               │
└───────────┼───────────────────────────────────────────────┘
            │
            │ JSON-RPC / APIs
            │
┌───────────▼───────────────────────────────────────────────┐
│              External Services & Networks                 │
│                                                           │
│  ┌──────────────────┐ ┌──────────────────┐               │
│  │ Sui Network      │ │ Google/Apple     │               │
│  │ (Blockchain)     │ │ OAuth (zkLogin)  │               │
│  └────────┬─────────┘ └────────┬─────────┘               │
│           │                    │                         │
│  ┌────────▼──────────┬─────────▼──────┐                 │
│  │ Smart Contracts   │ eKYC Provider  │                 │
│  │ ┌──────────────┐  │ (3rd-party)    │                 │
│  │ │ vnd_usdc     │  │                │                 │
│  │ │ oracle       │  │ GPS Validator  │                 │
│  │ │ sponsored_tx │  │ (Location API) │                 │
│  │ │ zklogin      │  │                │                 │
│  │ └──────────────┘  │                │                 │
│  └───────────────────┴────────────────┘                 │
│                                                         │
│  ┌────────────────────────────────────┐                │
│  │ Sui USDC Token Contract            │                │
│  │ (Standard token on Sui Mainnet)    │                │
│  └────────────────────────────────────┘                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Mobile Application Layer

**Technology**: React Native with Expo

#### Screens
- **Wallet Screen** - Display USDC balance, recent transactions
- **Conversion Screen** - VND ↔ USDC swap interface with amount input
- **Login Screen** - zkLogin via Google/Apple OAuth
- **KYC Verification Screen** - eKYC flow with ID capture
- **Location Verification Screen** - GPS consent & validation
- **Transaction History** - List of past conversions and transfers
- **Settings Screen** - User preferences, wallet management

#### Component Tree
```
App.tsx
├── NavigationStack
│   ├── LoginNavigator
│   │   ├── LoginScreen
│   │   ├── KycVerificationScreen
│   │   └── LocationVerificationScreen
│   └── MainNavigator (Post-Login)
│       ├── WalletScreen
│       ├── ConversionScreen
│       ├── TransactionHistoryScreen
│       └── SettingsScreen
```

### 2. Service Layer (Business Logic)

**Location**: `/app/src/services/`

#### Key Services

**SuiWalletService**
- Manages wallet state and balance
- Handles send/receive USDC transactions
- Integrates with Sui JSON-RPC
- Manages zkLogin authentication flow

```typescript
interface WalletService {
  getBalance(address: string): Promise<number>;
  sendTransaction(to: string, amount: number): Promise<string>;
  getTransactionHistory(address: string): Promise<Transaction[]>;
  getWalletAddress(): Promise<string>;
}
```

**ConversionService**
- Executes VND ↔ USDC conversions
- Calls smart contract for swap logic
- Applies sponsored transactions for gasless UX
- Handles conversion rate calculation

```typescript
interface ConversionService {
  convertVndToUsdc(vndAmount: number): Promise<ConversionResult>;
  convertUsdcToVnd(usdcAmount: number): Promise<ConversionResult>;
  getConversionRate(): Promise<ExchangeRate>;
  estimateOutput(input: number, direction: Direction): Promise<number>;
}
```

**KycVerificationService**
- Integrates with eKYC provider (3rd-party)
- Manages ID capture and verification
- Handles liveness checks
- Stores KYC status (backend or on-chain)

```typescript
interface KycService {
  startVerification(): Promise<void>;
  submitIdData(idDocument: Image, livenessSelfie: Image): Promise<void>;
  getVerificationStatus(): Promise<KycStatus>;
}
```

**LocationService**
- GPS location permissions and access
- Validates user is within Da Nang boundary
- Handles location caching and updates

```typescript
interface LocationService {
  requestPermission(): Promise<boolean>;
  getCurrentLocation(): Promise<Coordinates>;
  isInDaNang(coords: Coordinates): boolean;
  monitorLocationChanges(callback: (coords: Coordinates) => void): void;
}
```

**PriceOracleService**
- Fetches VND/USDC price from custom oracle
- Handles price caching and refresh
- Calculates conversion amounts with slippage

```typescript
interface PriceOracleService {
  getVndUsdcPrice(): Promise<number>;
  getHistoricalPrices(days: number): Promise<Price[]>;
  calculateOutput(input: number, slippage: number): Promise<number>;
}
```

### 3. Smart Contract Layer

**Location**: `/contracts/sources/`

**Network**: Sui Mainnet

#### Core Contracts

**vnd_usdc.move** - Conversion Logic
- Handles VND → USDC swap execution
- Handles USDC → VND swap execution
- Manages conversion request queue
- Emits conversion events for tracking

```move
public struct ConversionRequest has store {
    id: UID,
    user: address,
    from_amount: u64,
    from_currency: u8,  // 0 = VND, 1 = USDC
    rate: u64,
    status: u8,  // 0 = pending, 1 = completed, 2 = failed
    timestamp: u64
}

public fun convert_vnd_to_usdc(
    from_amount: u64,
    rate: u64
): ConversionResult
```

**oracle.move** - Price Oracle
- Maintains VND/USDC price feed
- Updates prices (admin function)
- Provides price lookup with timestamp
- Handles multiple data sources (eventual multi-oracle design)

```move
public struct PriceFeed has key {
    id: UID,
    vnd_price_per_usdc: u64,  // VND per 1 USDC
    timestamp: u64,
    source: vector<u8>
}

public fun get_current_price(feed: &PriceFeed): u64
```

**sponsored_txn.move** - Gasless Transactions
- Wraps conversion requests with sponsored tx metadata
- Handles fee calculation and payment
- Integrates with Sui sponsor protocol
- Ensures app covers gas fees for users

```move
public struct SponsoredTransaction has store {
    id: UID,
    inner_tx: ConversionRequest,
    sponsor: address,
    max_gas_budget: u64,
    gas_price: u64
}

public fun create_sponsored_conversion(
    request: ConversionRequest,
    sponsor: address,
    gas_budget: u64
): SponsoredTransaction
```

**zklogin.move** - Authentication Wrapper
- Integrates Sui's native zkLogin
- Manages user identifiers (UID from OAuth)
- Links OAuth identities to wallet addresses
- Handles account recovery flows

```move
public struct ZkLoginUser has store {
    id: UID,
    oauth_provider: vector<u8>,  // "google" or "apple"
    oauth_uid: vector<u8>,
    wallet_address: address,
    created_at: u64
}

public fun link_oauth_identity(
    provider: vector<u8>,
    uid: vector<u8>,
    wallet_address: address
): ZkLoginUser
```

### 4. Data Flow Architecture

#### Conversion Flow (VND → USDC)

```
User Input
    ↓
[ConversionScreen]
    ↓ vndAmount: 1,000,000
[ConversionService.convertVndToUsdc()]
    ↓
├─ Call PriceOracleService.getVndUsdcPrice()
│   └─ Query oracle.move contract → current rate
│
├─ Calculate output: 1,000,000 / rate = ~40 USDC
│
└─ Create conversion request
    ↓
[Sui Smart Contract: vnd_usdc.move]
    ↓
├─ Verify user KYC status (if stored on-chain)
├─ Verify user location (if validated on-chain)
├─ Execute conversion (burn VND, mint USDC equivalent)
├─ Create ConversionRequest record
└─ Emit ConversionCompleted event
    ↓
[Mobile App receives event]
    ↓
├─ Update wallet balance
├─ Record transaction in history
└─ Show success confirmation

Timeline: 1-3 seconds for on-chain execution
```

#### Transaction Flow (Send USDC)

```
User Input: Send 10 USDC to address
    ↓
[WalletScreen → SendModal]
    ↓
[SuiWalletService.sendTransaction()]
    ↓
├─ Validate recipient address
├─ Check sender balance
├─ Build transaction (USDC transfer)
├─ Apply sponsored transaction wrapper
│   └─ App pays gas fees
└─ Submit to Sui network
    ↓
[Sui Blockchain]
    ↓
├─ Verify sponsor authorization
├─ Execute USDC transfer
└─ Emit Transfer event
    ↓
[Mobile App: Listen to events]
    ↓
├─ Poll transaction status
├─ Update balance once confirmed
└─ Show confirmation

Timeline: 3-5 seconds for confirmation
```

#### Authentication Flow (zkLogin)

```
User taps "Sign in with Google/Apple"
    ↓
[LoginScreen]
    ↓
[SuiWalletService.initiateZkLogin()]
    ↓
├─ Redirect to OAuth provider (Google/Apple)
│   └─ User grants permission
│
├─ Receive OAuth token/UID
└─ Send to Sui's zkLogin proving service
    ↓
[Sui zkLogin Service]
    ↓
├─ Verify JWT signature
├─ Generate zero-knowledge proof
└─ Return zkLogin wallet address
    ↓
[Mobile App]
    ↓
├─ Store wallet address in secure storage
├─ Link to backend user profile (via KycService)
└─ Navigate to main wallet

Timeline: 5-10 seconds (includes user interaction)
```

### 5. External Integrations

#### OAuth Providers
- **Google** - Sign in with Google
- **Apple** - Sign in with Apple
- Handled by Sui's native zkLogin system

#### eKYC Provider
- 3rd-party service (vendor TBD)
- APIs for:
  - ID document verification
  - Liveness detection
  - Result callbacks to mobile app
- KYC status stored locally and/or on-chain

#### Location Services
- Device GPS via React Native
- Geographic validation (Da Nang boundary check)
- Privacy-first: location used only for validation

#### Sui Network
- JSON-RPC endpoint for transaction submission
- Event subscription for status updates
- Price oracle data for VND/USDC rates

#### USDC Token
- Native USDC contract on Sui Mainnet
- Standard Sui token contract interface
- All conversions settle in native USDC

### 6. State Management

**Local Storage**:
- User wallet address
- OAuth token (secure storage)
- Transaction cache
- Recent prices cache

**Backend/On-chain** (TBD):
- KYC verification status
- Location verification history
- Conversion request history
- User profile data

**Blockchain State**:
- Conversion records (for auditing)
- Price feed updates
- User balances (via token contract)

### 7. Security Architecture

#### Authentication
- OAuth via zkLogin (no seed phrases exposed)
- Wallet address derived from OAuth identity
- Zero-knowledge proofs prevent service from knowing user identity

#### Authorization
- KYC verification required for VND features
- Location check required for Da Nang users
- On-chain state validation before conversions

#### Transaction Security
- Sponsored transactions signed by app keypair
- User transaction data not exposed to app
- All critical operations logged

#### Data Protection
- Sensitive data in secure storage (OAuth tokens)
- API calls over HTTPS only
- No hardcoded secrets
- Environment-based configuration

### 8. Scalability Considerations

**Current Design**:
- Single app instance
- Direct Sui RPC calls (no indexer yet)
- In-memory caching

**Future Scaling**:
- Backend service for KYC/location caching
- Sui indexer for transaction history
- Price oracle aggregation from multiple sources
- Rate limiting and queue management

## Technology Stack Rationale

| Component | Technology | Why |
|-----------|-----------|-----|
| Mobile | React Native + Expo | Cross-platform (iOS/Android), rapid development |
| Blockchain | Sui Move | Smart contract language, efficient, safe |
| Auth | zkLogin | Seedless, OAuth-native, mainstream-friendly |
| VND Oracle | Custom contract | Pyth/Supra don't support VND |
| Sponsored TX | Sui native | Built-in feature, gasless UX |

## Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| App startup | < 3s | First screen visible |
| Wallet balance fetch | < 1s | RPC query |
| Conversion execute | < 3s | Smart contract execution |
| Transaction confirm | < 5s | Sui consensus |
| Login | < 10s | OAuth + zkLogin proof |

## Known Limitations (Phase 1)

- VND deposit: Manual bank transfer only (no integration)
- Location: GPS only, no cell tower fallback
- Oracle: Single price source (centralized risk)
- KYC: 3rd-party provider TBD
- Blockchain: Sui Testnet initially, Mainnet for production
