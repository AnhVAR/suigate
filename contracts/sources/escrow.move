/// Escrow module for Smart Sell orders
/// Locks USDC until target rate is met
module suigate::escrow {
    use sui::coin::Coin;
    use sui::clock::Clock;

    // Error codes
    const E_NOT_OWNER: u64 = 1;
    const E_RATE_NOT_MET: u64 = 2;
    const E_ESCROW_EXPIRED: u64 = 3;

    /// Escrow object holding locked USDC
    public struct Escrow<phantom T> has key, store {
        id: UID,
        owner: address,
        usdc_balance: Coin<T>,
        target_rate: u64,
        bank_account_id: u64,
        created_at: u64,
    }

    /// Admin capability for executing escrows
    public struct AdminCap has key, store {
        id: UID,
    }

    // TODO: Implement create_escrow
    // TODO: Implement cancel_escrow
    // TODO: Implement execute_escrow
    // TODO: Implement partial_fill
}
