# Project Roadmap - SuiGate

8-day hackathon sprint (Jan 30 - Feb 8, 2026) for ETHGlobal HackMoney 2026.

## Sprint Overview

**Event**: ETHGlobal HackMoney 2026
**Duration**: 9 days (Jan 30 - Feb 8, 2026, deadline Feb 8 12:00 PM EST)
**Team Size**: 1 (Solo)
**Stake**: 0.005 ETH
**Goal**: Functional MVP for VND ↔ USDC wallet with zkLogin, eKYC, location validation

## Phase Breakdown (8 Days)

### Phase 1: Setup & Planning (Day 1: Jan 30)

**Status**: ▓░░░░░░░░░░░░░░░░░░ In Progress (0%)
**Duration**: 1 day

**Goals**:
- Initialize project structure
- Setup development environment
- Create documentation foundation
- Plan implementation phases

**Tasks**:
- [ ] Create `/app` and `/contracts` directories
- [ ] Initialize Expo project with TypeScript
- [ ] Initialize Move project with Sui CLI
- [ ] Setup Git branches and commit hooks
- [ ] Create implementation plans in `/plans`
- [ ] Document tech stack and conventions

**Deliverables**:
- Project structure ready
- Development environment configured
- Documentation in place
- Implementation roadmap created

**Next Phase Dependency**: Complete before Phase 2

---

### Phase 2: Smart Contracts Foundation (Days 2-3: Jan 31 - Feb 1)

**Status**: ░░░░░░░░░░░░░░░░░░░ Not Started (0%)
**Duration**: 2 days

**Goals**:
- Implement core Move smart contracts
- Setup oracle for VND/USDC pricing
- Implement sponsored transaction handler
- Test contracts on Testnet

**Contracts to Build**:

1. **vnd_usdc.move** - Conversion Logic
   - [ ] ConversionRequest struct
   - [ ] convert_vnd_to_usdc() function
   - [ ] convert_usdc_to_vnd() function
   - [ ] Event emission for tracking
   - [ ] Unit tests

2. **oracle.move** - Price Oracle
   - [ ] PriceFeed struct
   - [ ] get_current_price() function
   - [ ] update_price() function (admin)
   - [ ] Price caching logic
   - [ ] Unit tests

3. **sponsored_txn.move** - Gasless Transactions
   - [ ] SponsoredTransaction struct
   - [ ] Fee calculation logic
   - [ ] Sponsor validation
   - [ ] Integration with vnd_usdc
   - [ ] Unit tests

4. **zklogin.move** - OAuth Integration Wrapper
   - [ ] ZkLoginUser struct
   - [ ] link_oauth_identity() function
   - [ ] get_user_wallet() function
   - [ ] Account recovery helpers
   - [ ] Unit tests

**Success Criteria**:
- All contracts compile without errors
- Unit tests pass (90%+ coverage)
- Testnet deployment successful
- No security warnings from move analyzer

**Risks**:
- Sui testnet instability (mitigation: use local simulator)
- Oracle price feed data source issues (mitigation: mock data for MVP)
- Move language complexity (mitigation: reference Sui examples)

**Next Phase Dependency**: Contracts deployed and tested

---

### Phase 3: Mobile App Foundation (Days 3-4: Feb 1-2)

**Status**: ░░░░░░░░░░░░░░░░░░░ Not Started (0%)
**Duration**: 2 days (overlaps with Phase 2)

**Goals**:
- Setup React Native navigation structure
- Create authentication UI screens
- Implement wallet screen framework
- Setup TypeScript configuration

**Tasks**:

1. **Project Setup**
   - [ ] Create Expo project with TypeScript
   - [ ] Configure expo.json for iOS/Android
   - [ ] Setup navigation libraries (React Navigation)
   - [ ] Configure TypeScript paths

2. **Navigation Structure**
   - [ ] Create NavigationStack component
   - [ ] Setup AuthNavigator (pre-login screens)
   - [ ] Setup MainNavigator (post-login screens)
   - [ ] Implement deep linking support

3. **Auth Screens**
   - [ ] LoginScreen - OAuth button, loading state
   - [ ] KycVerificationScreen - ID capture UI placeholder
   - [ ] LocationVerificationScreen - GPS permission UI

4. **Main Screens**
   - [ ] WalletScreen - Balance display, transaction button placeholders
   - [ ] ConversionScreen - Amount input, swap direction, rate display
   - [ ] TransactionHistoryScreen - Empty list UI
   - [ ] SettingsScreen - Basic user options

5. **Component Library**
   - [ ] PrimaryActionButton
   - [ ] SecondaryActionButton
   - [ ] CurrencyInput
   - [ ] LoadingSpinner
   - [ ] ErrorAlert

**Success Criteria**:
- App builds and runs on iOS simulator
- Navigation flows correctly between screens
- No TypeScript compilation errors
- Basic UI responsive on different screen sizes

**Next Phase Dependency**: App structure ready for service integration

---

### Phase 4: Service Layer & Integrations (Days 5-6: Feb 3-4)

**Status**: ░░░░░░░░░░░░░░░░░░░ Not Started (0%)
**Duration**: 2 days

**Goals**:
- Implement business logic services
- Integrate with Sui blockchain
- Connect OAuth/zkLogin
- Setup eKYC placeholder

**Services to Build**:

1. **SuiWalletService**
   - [ ] getBalance() - Fetch USDC balance via RPC
   - [ ] sendTransaction() - Send USDC to address
   - [ ] getTransactionHistory() - Query recent transactions
   - [ ] initiateZkLogin() - Start OAuth flow
   - [ ] getWalletAddress() - Retrieve current wallet

2. **ConversionService**
   - [ ] convertVndToUsdc() - Call smart contract
   - [ ] convertUsdcToVnd() - Call smart contract
   - [ ] getConversionRate() - Fetch from oracle
   - [ ] estimateOutput() - Calculate with slippage
   - [ ] getHistoricalRates() - Price history

3. **KycVerificationService**
   - [ ] startVerification() - Init eKYC provider
   - [ ] submitIdData() - Send documents to provider
   - [ ] getVerificationStatus() - Check status
   - [ ] Store KYC results locally (phase 1)

4. **LocationService**
   - [ ] requestPermission() - Ask for GPS access
   - [ ] getCurrentLocation() - Get user coords
   - [ ] isInDaNang() - Check boundary validation
   - [ ] getLocationPermissionStatus() - Permission state

5. **PriceOracleService**
   - [ ] getVndUsdcPrice() - Fetch current rate
   - [ ] cachePrice() - Local caching (5min TTL)
   - [ ] getHistoricalPrices() - Price history
   - [ ] calculateSlippage() - Output estimation

**External Integrations**:
- [ ] Sui JSON-RPC connection setup
- [ ] OAuth provider integration (Google/Apple)
- [ ] zkLogin provider integration
- [ ] eKYC provider API setup (mock for MVP)
- [ ] Location services API

**Success Criteria**:
- Services compile and import correctly
- Sui RPC calls successful on Testnet
- OAuth flow initiation works
- Mock data flows through services
- TypeScript types properly defined

**Next Phase Dependency**: Services ready for UI connection

---

### Phase 5: Feature Implementation (Days 6-7: Feb 5-6)

**Status**: ░░░░░░░░░░░░░░░░░░░ Not Started (0%)
**Duration**: 2 days

**Goals**:
- Connect UI to services
- Implement core user flows
- Test end-to-end functionality
- Polish user experience

**Features to Implement**:

1. **Authentication Flow**
   - [ ] Connect LoginScreen to zkLogin service
   - [ ] Handle OAuth callback and token storage
   - [ ] Derive wallet address from zkLogin
   - [ ] Store in secure storage
   - [ ] Auto-login on app restart

2. **Wallet Display**
   - [ ] Fetch and display USDC balance
   - [ ] Show recent transactions
   - [ ] Implement pull-to-refresh
   - [ ] Handle loading and error states

3. **VND → USDC Conversion**
   - [ ] VND input validation (1000+ minimum)
   - [ ] Fetch current exchange rate
   - [ ] Calculate USDC output amount
   - [ ] Display conversion fee estimate
   - [ ] Execute conversion via smart contract
   - [ ] Show success confirmation

4. **USDC → VND Conversion**
   - [ ] USDC input validation
   - [ ] Fetch current exchange rate
   - [ ] Calculate VND output
   - [ ] Execute conversion
   - [ ] Display success confirmation

5. **Send USDC**
   - [ ] Address input with validation
   - [ ] Amount input with balance check
   - [ ] Fee estimation (sponsored)
   - [ ] Confirm and send
   - [ ] Transaction status polling

6. **eKYC Integration**
   - [ ] Request permission flow
   - [ ] ID document capture UI
   - [ ] Liveness check integration
   - [ ] Store verification status
   - [ ] Block VND features until verified

7. **Location Verification**
   - [ ] Request GPS permission
   - [ ] Get current location
   - [ ] Check Da Nang boundary
   - [ ] Store location status
   - [ ] Block VND features if outside

8. **Transaction History**
   - [ ] Fetch past conversions and transfers
   - [ ] Display in chronological order
   - [ ] Show status (pending/completed/failed)
   - [ ] Filter by type

**Success Criteria**:
- All user flows complete end-to-end
- Data flows correctly from UI to contracts
- Error handling works for all paths
- Loading states display properly
- Transaction confirmations show correctly

**Next Phase Dependency**: Feature testing complete

---

### Phase 6: Testing & Quality Assurance (Day 7-8: Feb 6-7)

**Status**: ░░░░░░░░░░░░░░░░░░░ Not Started (0%)
**Duration**: 1.5 days

**Goals**:
- Test all critical paths
- Fix bugs and edge cases
- Optimize performance
- Verify blockchain interactions

**Testing Plan**:

1. **Unit Tests**
   - [ ] Service layer unit tests
   - [ ] Utility function tests
   - [ ] Type validation tests
   - [ ] Target: 80%+ code coverage

2. **Integration Tests**
   - [ ] Authentication flow
   - [ ] Conversion flow (contract + UI)
   - [ ] Transaction sending
   - [ ] eKYC verification flow
   - [ ] Location validation

3. **Manual Testing**
   - [ ] Complete user journeys on simulator
   - [ ] Test on multiple device sizes
   - [ ] Verify error messages are clear
   - [ ] Test with network failures
   - [ ] Check offline behavior

4. **Smart Contract Testing**
   - [ ] Unit tests for all modules
   - [ ] Integration tests for conversion flow
   - [ ] Test sponsored transaction flow
   - [ ] Test edge cases (zero amounts, overflow, etc)

5. **Performance Testing**
   - [ ] App startup time < 3s
   - [ ] Balance fetch < 1s
   - [ ] Conversion execute < 3s
   - [ ] UI responsiveness

**Test Scenarios**:
- [ ] Happy path: Complete conversion flow
- [ ] Invalid input: Non-numeric amounts
- [ ] Insufficient balance: Send more than available
- [ ] Network error: Service unavailable
- [ ] Location outside Da Nang: Block VND features
- [ ] eKYC not verified: Block conversion
- [ ] OAuth cancellation: Handle gracefully

**Success Criteria**:
- No critical bugs remaining
- All main flows tested
- Performance targets met
- Error states handled gracefully

**Next Phase Dependency**: QA sign-off

---

### Phase 7: Demo Preparation & Submission (Day 8: Feb 7)

**Status**: ░░░░░░░░░░░░░░░░░░░ Not Started (0%)
**Duration**: 1 day

**Goals**:
- Record demo video
- Prepare submission materials
- Document AI usage
- Final code review

**Tasks**:

1. **Demo Video** (2-4 min, 720p+)
   - [ ] Record app walkthrough
   - [ ] Show zkLogin authentication
   - [ ] Demonstrate VND → USDC conversion
   - [ ] Show transaction history
   - [ ] Include on-screen narration
   - [ ] 720p minimum resolution
   - [ ] Clear audio, no TTS

2. **Documentation**
   - [ ] Update README with setup instructions
   - [ ] Complete AI_USAGE.md
   - [ ] Document any known limitations
   - [ ] Add troubleshooting section

3. **Git & Submission**
   - [ ] Ensure clean commit history (no squashes)
   - [ ] All commits have meaningful messages
   - [ ] Tag release version
   - [ ] Verify GitHub repo is public
   - [ ] Submit before Feb 8, 12:00 PM EST

4. **Code Cleanup**
   - [ ] Remove console.log statements
   - [ ] Remove TODO comments (or complete)
   - [ ] Code review final state
   - [ ] Fix any linting issues

**Submission Checklist**:
- [ ] Demo video recorded and uploaded
- [ ] GitHub repo link ready
- [ ] AI_USAGE.md complete
- [ ] README clear and accurate
- [ ] Commit history visible
- [ ] No hardcoded secrets
- [ ] All tests passing

**Success Criteria**:
- Demo video 2-4 minutes, clear and compelling
- All submission materials ready
- Code submission complete
- No disqualification issues

---

## Milestone Summary

| Milestone | Target Date | Status | Notes |
|-----------|------------|--------|-------|
| Project Setup | Jan 30 | ▓░░░░░ In Progress | Docs created, awaiting code init |
| Smart Contracts Deployed | Feb 1 | ░░░░░░░░░░ Not Started | Testnet deployment |
| Mobile App Structure | Feb 2 | ░░░░░░░░░░ Not Started | Navigation and screens |
| Services Integrated | Feb 4 | ░░░░░░░░░░ Not Started | Blockchain and API integration |
| Core Features Working | Feb 6 | ░░░░░░░░░░ Not Started | End-to-end flows |
| QA & Testing Complete | Feb 7 | ░░░░░░░░░░ Not Started | All critical paths tested |
| **Submission** | **Feb 8 12:00 PM EST** | ░░░░░░░░░░ Not Started | **HARD DEADLINE** |

## MVP Feature List

**Tier 1 (Must Have)**:
- ✅ zkLogin authentication (OAuth)
- ✅ USDC balance display
- ✅ VND → USDC conversion (testnet)
- ✅ Send USDC to address
- ✅ Transaction history view
- ✅ eKYC verification UI
- ✅ Location validation (Da Nang check)

**Tier 2 (Nice to Have)**:
- ⚠️ Bank transfer integration (manual process)
- ⚠️ USDC → VND conversion
- ⚠️ Multi-language UI
- ⚠️ Transaction notifications
- ⚠️ QR code scanning

**Tier 3 (Future)**:
- ❌ Mainnet deployment
- ❌ Multiple currency support
- ❌ Advanced analytics
- ❌ Staking integration
- ❌ NFT integration

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Sui testnet instability | Medium | High | Use local Move simulator, switch to mainnet |
| VND oracle data issues | Medium | High | Implement mock oracle with fixed rates for MVP |
| eKYC provider not available | Low | Medium | Use placeholder/mock for MVP phase |
| Performance issues on low-end devices | Low | Medium | Optimize React rendering, lazy load screens |
| OAuth integration complexity | Low | Medium | Reference Sui zkLogin examples |
| Time management | High | Critical | Focus on MVP only, cut tier 2/3 features |

## Success Metrics

**Technical**:
- All critical user flows complete end-to-end
- Smart contracts deployed and tested
- Mobile app runs on iOS/Android simulators
- Transaction execution time < 5 seconds

**Product**:
- User can complete full conversion flow in < 30 seconds
- Error messages are clear and actionable
- Demo video shows compelling use case
- Code is well-organized and maintainable

**Hackathon**:
- Submit before deadline (Feb 8, 12:00 PM EST)
- Full commit history visible in GitHub
- AI_USAGE.md accurately documents all assistance
- Demo video meets requirements

## Timeline Flexibility

**If Behind Schedule**:
1. Cut Tier 2 features (USDC → VND conversion)
2. Use mock eKYC verification
3. Use testnet instead of mainnet
4. Skip bank integration
5. Simplify UI/animations

**If Ahead of Schedule**:
1. Add USDC → VND conversion
2. Implement bank transfer integration
3. Add transaction notifications
4. Optimize performance
5. Add unit/integration tests

## Notes

- **Blockchain Network**: Start on Testnet, consider mainnet near end if time permits
- **AI Usage**: Log all AI assistance in `AI_USAGE.md` per hackathon rules
- **Code Originality**: All code written after Jan 30, no pre-existing code
- **Commits**: Frequent, meaningful commits for judge review
- **Demo**: Focus on core flow, not perfection
