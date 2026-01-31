/// Price Oracle for VND/USDC rates
/// Backend updates rates from Binance API
module suigate::price_oracle {
    use sui::clock::Clock;

    // Constants
    const MAX_STALENESS_MS: u64 = 600_000; // 10 minutes

    // Error codes
    const E_STALE_PRICE: u64 = 1;
    const E_NOT_ADMIN: u64 = 2;
    const E_INVALID_RATE: u64 = 3;

    /// Oracle storing VND/USDC rates
    public struct PriceOracle has key {
        id: UID,
        buy_rate: u64,
        sell_rate: u64,
        mid_rate: u64,
        spread_bps: u64,
        last_updated: u64,
        source: vector<u8>,
    }

    /// Admin capability for updating oracle
    public struct OracleAdminCap has key, store {
        id: UID,
    }

    // TODO: Implement update_rates
    // TODO: Implement get_buy_rate (with staleness check)
    // TODO: Implement get_sell_rate (with staleness check)
    // TODO: Implement get_mid_rate
}
