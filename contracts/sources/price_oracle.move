/// PriceOracle - On-chain VND/USDC rate oracle with staleness check
/// Backend pushes rates, contracts read with staleness validation
module suigate::price_oracle {
    use sui::clock::Clock;
    use sui::event;
    use suigate::admin_cap::AdminCap;

    // === Errors ===
    const E_STALE_PRICE: u64 = 0;
    const E_INVALID_SPREAD: u64 = 1;
    const E_ZERO_RATE: u64 = 2;

    // === Constants ===
    const MAX_STALENESS_MS: u64 = 600_000; // 10 minutes
    const BPS_BASE: u64 = 10_000;

    /// On-chain VND/USDC price oracle
    public struct PriceOracle has key {
        id: UID,
        buy_rate: u64,      // VND per USDC (user buys USDC at this rate - higher)
        sell_rate: u64,     // VND per USDC (user sells USDC at this rate - lower)
        mid_rate: u64,      // Market mid-point reference
        spread_bps: u64,    // Spread in basis points (50 = 0.5%)
        last_updated: u64,  // Timestamp in milliseconds
    }

    // === Events ===
    public struct RatesUpdated has copy, drop {
        mid_rate: u64,
        buy_rate: u64,
        sell_rate: u64,
        spread_bps: u64,
        timestamp: u64,
    }

    /// Create shared PriceOracle with initial zero values
    fun init(ctx: &mut TxContext) {
        let oracle = PriceOracle {
            id: object::new(ctx),
            buy_rate: 0,
            sell_rate: 0,
            mid_rate: 0,
            spread_bps: 0,
            last_updated: 0,
        };
        transfer::share_object(oracle);
    }

    // === Admin functions ===

    /// Update rates - admin only
    /// Calculates buy/sell rates from mid_rate and spread
    public fun update_rates(
        _admin: &AdminCap,
        oracle: &mut PriceOracle,
        mid_rate: u64,
        spread_bps: u64,
        clock: &Clock,
    ) {
        assert!(mid_rate > 0, E_ZERO_RATE);
        assert!(spread_bps < BPS_BASE, E_INVALID_SPREAD);

        // Calculate buy/sell rates with spread
        let buy_rate = mid_rate * (BPS_BASE + spread_bps) / BPS_BASE;
        let sell_rate = mid_rate * (BPS_BASE - spread_bps) / BPS_BASE;
        let timestamp = clock.timestamp_ms();

        oracle.mid_rate = mid_rate;
        oracle.buy_rate = buy_rate;
        oracle.sell_rate = sell_rate;
        oracle.spread_bps = spread_bps;
        oracle.last_updated = timestamp;

        event::emit(RatesUpdated {
            mid_rate,
            buy_rate,
            sell_rate,
            spread_bps,
            timestamp,
        });
    }

    // === Public read functions ===

    /// Get buy rate with staleness check
    public fun get_buy_rate(oracle: &PriceOracle, clock: &Clock): u64 {
        assert_not_stale(oracle, clock);
        oracle.buy_rate
    }

    /// Get sell rate with staleness check
    public fun get_sell_rate(oracle: &PriceOracle, clock: &Clock): u64 {
        assert_not_stale(oracle, clock);
        oracle.sell_rate
    }

    /// Get mid rate with staleness check
    public fun get_mid_rate(oracle: &PriceOracle, clock: &Clock): u64 {
        assert_not_stale(oracle, clock);
        oracle.mid_rate
    }

    /// Get all oracle info (no staleness check - for UI display)
    public fun get_info(oracle: &PriceOracle): (u64, u64, u64, u64, u64) {
        (oracle.buy_rate, oracle.sell_rate, oracle.mid_rate, oracle.spread_bps, oracle.last_updated)
    }

    // === Internal ===

    fun assert_not_stale(oracle: &PriceOracle, clock: &Clock) {
        let now = clock.timestamp_ms();
        assert!(now - oracle.last_updated < MAX_STALENESS_MS, E_STALE_PRICE);
    }

    // === Test helpers ===
    #[test_only]
    public fun create_for_testing(ctx: &mut TxContext): PriceOracle {
        PriceOracle {
            id: object::new(ctx),
            buy_rate: 0,
            sell_rate: 0,
            mid_rate: 0,
            spread_bps: 0,
            last_updated: 0,
        }
    }

    #[test_only]
    public fun share_for_testing(oracle: PriceOracle) {
        transfer::share_object(oracle);
    }
}
