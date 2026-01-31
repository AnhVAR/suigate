# Code Standards - SuiGate Development

Development conventions, patterns, and best practices for SuiGate codebase.

## File Organization

### File Naming Convention

Use **kebab-case** with long, descriptive names. File names should be self-documenting when viewed in file lists.

**Good Examples:**
```
price-oracle-service.ts
user-kyc-verification-modal.tsx
vnd-usdc-conversion-hook.ts
location-permission-util.ts
sponsored-transaction-handler.ts
wallet-balance-display.tsx
```

**Bad Examples:**
```
service.ts            # What service?
modal.tsx             # What modal?
utils.ts              # Too generic
helper.ts             # Unclear purpose
```

### Directory Structure

```
/app/src/
├── components/           # Reusable UI components
│   ├── buttons/
│   │   ├── primary-action-button.tsx
│   │   └── secondary-action-button.tsx
│   ├── modals/
│   │   ├── confirmation-modal.tsx
│   │   └── error-alert-modal.tsx
│   ├── forms/
│   │   ├── kyc-verification-form.tsx
│   │   └── conversion-amount-input.tsx
│   └── common/
│       ├── loading-spinner.tsx
│       └── navigation-header.tsx
│
├── screens/              # Full screen components
│   ├── wallet-screen.tsx
│   ├── conversion-screen.tsx
│   ├── kyc-verification-screen.tsx
│   └── transaction-history-screen.tsx
│
├── services/             # Business logic, external APIs
│   ├── sui-wallet-service.ts
│   ├── kyc-verification-service.ts
│   ├── location-service.ts
│   ├── price-oracle-service.ts
│   └── transaction-service.ts
│
├── hooks/                # Custom React hooks
│   ├── use-wallet-balance.ts
│   ├── use-conversion-rate.ts
│   ├── use-user-location.ts
│   └── use-kyc-status.ts
│
├── utils/                # Utility functions
│   ├── currency-formatter.ts
│   ├── address-validator.ts
│   ├── error-handler.ts
│   └── crypto-operations.ts
│
├── types/                # TypeScript type definitions
│   ├── wallet.types.ts
│   ├── transaction.types.ts
│   ├── kyc.types.ts
│   └── common.types.ts
│
├── constants/            # App constants
│   ├── app-config.ts
│   ├── api-endpoints.ts
│   └── error-messages.ts
│
└── App.tsx               # Root component
```

### Move Contract Structure

```
/contracts/sources/
├── vnd_usdc.move         # VND↔USDC conversion logic
├── oracle.move           # Custom VND price oracle
├── sponsored_txn.move    # Sponsored transaction handler
└── zklogin.move          # zkLogin wrapper

/contracts/tests/
├── vnd_usdc_tests.move
├── oracle_tests.move
└── sponsored_txn_tests.move
```

## TypeScript/React Native Conventions

### Component Naming

Use **PascalCase** for component files and exports.

```typescript
// Good
export const WalletBalanceDisplay: React.FC<Props> = ({ balance }) => {
  return <Text>{balance}</Text>;
};

// Bad
export const walletBalanceDisplay = () => {
  return <Text>balance</Text>;
};
```

### Type/Interface Naming

Use **PascalCase** with appropriate suffixes.

```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
}

type ConversionRequest = {
  from_amount: number;
  from_currency: 'VND' | 'USDC';
  to_currency: 'VND' | 'USDC';
};

interface TransactionHistory extends BaseEntity {
  tx_hash: string;
  status: TransactionStatus;
}

// Bad
type user = {};
interface conversion_req {}
type tx = {};
```

### Variable/Function Naming

Use **camelCase** for variables and functions.

```typescript
// Good
const walletBalance = 1000;
const convertVndToUsdc = (vndAmount: number): number => {};
function getUserKycStatus(userId: string): Promise<KycStatus> {}

// Bad
const wallet_balance = 1000;
const ConvertVndToUsdc = () => {};
function get_user_kyc_status() {}
```

### Enum Naming

Use **PascalCase** for enum names, **UPPER_SNAKE_CASE** for values (when appropriate).

```typescript
// Good
enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

enum Currency {
  VND = 'VND',
  USDC = 'USDC'
}

// Bad
enum transactionStatus {}
enum transaction_status {}
```

## React Native Best Practices

### Component Structure

```typescript
// Good structure
interface ComponentProps {
  title: string;
  onPress?: () => void;
  isLoading?: boolean;
}

export const MyComponent: React.FC<ComponentProps> = ({
  title,
  onPress,
  isLoading = false
}) => {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Side effects
  }, []);

  const handleAction = () => {
    // Logic
  };

  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};

MyComponent.defaultProps = {
  isLoading: false
};
```

### Hooks Usage

- Extract logic into custom hooks for reusability
- Hooks start with `use` prefix
- Keep hooks focused on single concern

```typescript
// Good: Custom hook
export const useWalletBalance = (address: string) => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBalance(address).then(setBalance).finally(() => setLoading(false));
  }, [address]);

  return { balance, loading };
};

// Usage in component
const MyScreen = () => {
  const { balance, loading } = useWalletBalance(address);
  return <Text>{balance}</Text>;
};
```

### Styling

Use React Native `StyleSheet` for performance.

```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12
  }
});

export const MyComponent = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Title</Text>
  </View>
);
```

## Move Smart Contract Conventions

### Module Naming

Use **snake_case** for Move module names.

```move
// Good
module suigate::vnd_usdc_converter {
    // ...
}

module suigate::price_oracle {
    // ...
}

// Bad
module suigate::VndUsdc {}
module suigate::priceOracle {}
```

### Function/Constant Naming

Use **snake_case** for functions and constants.

```move
// Good
public fun convert_vnd_to_usdc(amount: u64): u64 {
    // ...
}

const MIN_CONVERSION_AMOUNT: u64 = 100_000;

// Bad
public fun convertVndToUsdc() {}
const minConversionAmount: u64 = 100_000;
```

### Struct Naming

Use **PascalCase** for structs.

```move
// Good
public struct ConversionRequest has store {
    from_amount: u64,
    to_currency: u8
}

public struct PriceFeed has key {
    id: UID,
    vnd_price: u64
}

// Bad
public struct conversion_request {}
public struct price_feed {}
```

## Error Handling

### TypeScript Error Handling

```typescript
// Good: Explicit error handling
try {
  const result = await convertCurrency(amount);
  return result;
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
    throw new InvalidAmountError(error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network failure:', error.message);
    throw new ServiceUnavailableError('Conversion service unavailable');
  }
  throw error;
}

// Good: Error types
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class InvalidAmountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAmountError';
  }
}
```

### Move Error Handling

```move
// Good: Abort with specific codes
public fun convert_vnd_to_usdc(amount: u64) {
    assert!(amount > 0, EInvalidAmount);
    assert!(amount <= MAX_AMOUNT, EAmountTooLarge);
    // ...
}

const EInvalidAmount: u64 = 1;
const EAmountTooLarge: u64 = 2;
const EUnauthorized: u64 = 3;
```

## Code Comments

### When to Comment

- Complex business logic
- Non-obvious algorithmic decisions
- Security-critical sections
- Integration points with external systems

### Good Comment Examples

```typescript
// Calculate conversion with slippage tolerance (0.5%)
// This protects against front-running on the price oracle
const minOutputAmount = (outputAmount * 0.995);

// eKYC verification must complete before VND transactions
// Regulatory requirement for Vietnam market
if (!user.kyc_verified) {
  throw new KycNotVerifiedError();
}

// GPS location check: Da Nang sandbox phase 1
// Only users within Da Nang boundary can access VND features
const isInDaNang = checkGpsLocation(userCoords);
```

### Avoid Over-Commenting

```typescript
// Bad: Obvious comments
const balance = 100;  // Set balance to 100
const name = "John";  // Set name to John
```

## Import Organization

Import statements in this order:
1. External libraries
2. Sui/blockchain libraries
3. Internal components/hooks
4. Internal services/utils
5. Types
6. Constants

```typescript
// Good ordering
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useSuiClient } from '@mysten/dapp-kit';

import WalletScreen from './screens/wallet-screen';
import { useWalletBalance } from './hooks/use-wallet-balance';
import { suiService } from './services/sui-wallet-service';
import type { TransactionRequest } from './types/transaction.types';
import { API_ENDPOINTS } from './constants/api-endpoints';
```

## Testing Conventions

### TypeScript Test Naming

```typescript
// Good
describe('useWalletBalance', () => {
  it('should fetch balance for valid address', async () => {});
  it('should return 0 for invalid address', async () => {});
  it('should handle network errors gracefully', async () => {});
});

// Good test naming pattern: should [action] [condition]
```

### Move Test Naming

```move
#[test]
fun test_convert_vnd_to_usdc_valid_amount() {
    // ...
}

#[test]
#[expected_failure(abort_code = vnd_usdc::EInvalidAmount)]
fun test_convert_vnd_to_usdc_zero_amount_fails() {
    // ...
}
```

## Code Review Checklist

Before committing:
- [ ] File naming follows kebab-case convention
- [ ] Component/type names follow correct casing
- [ ] No commented-out code blocks
- [ ] Error handling is explicit
- [ ] Imports are organized
- [ ] TypeScript types are properly defined
- [ ] Tests pass and cover key scenarios
- [ ] No console.log() left in production code
- [ ] API calls use proper error handling

## Performance Considerations

### Mobile App

- Use `React.memo` for expensive components
- Optimize re-renders with proper dependency arrays
- Lazy load screens and large components
- Use FlatList for long lists, not ScrollView

```typescript
// Good: Memoized component
const TransactionItem = React.memo(({ transaction }: Props) => (
  <View>
    <Text>{transaction.id}</Text>
  </View>
));
```

### Smart Contracts

- Minimize storage operations
- Use efficient data structures
- Avoid unnecessary loops
- Pre-compute when possible

```move
// Good: Efficient loop
vector::for_each(items, |item| {
    process_item(item);
});
```

## Git Conventions

- Commit messages: Conventional Commits format
- Branch names: feature/xxx, fix/xxx, docs/xxx
- No force pushes to main
- Rebase before merge for clean history

Example commit: `feat: add vnd-to-usdc conversion service`

## Security Standards

- Never hardcode secrets or API keys
- Use environment variables for sensitive config
- Validate all user inputs
- Sanitize external data
- Use HTTPS for all API calls
- Implement proper authorization checks
- Log security events (not sensitive data)

See security guidelines in project-overview-pdr.md for additional requirements.
