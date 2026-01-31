/// LiquidityPool - Platform-funded USDC reserve for Buy/Quick Sell flows
/// Admin manages liquidity, dispenses for Buy orders, receives Quick Sell deposits
module suigate::liquidity_pool {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::event;
    use suigate::admin_cap::AdminCap;

    // === Errors ===
    const E_POOL_INACTIVE: u64 = 0;
    const E_INSUFFICIENT_LIQUIDITY: u64 = 1;
    const E_ZERO_AMOUNT: u64 = 2;

    /// Platform liquidity pool for any coin type T (USDC)
    public struct LiquidityPool<phantom T> has key {
        id: UID,
        reserve: Balance<T>,
        total_volume: u64,
        is_active: bool,
    }

    // === Events ===
    public struct LiquidityAdded has copy, drop {
        amount: u64,
        new_reserve: u64,
    }

    public struct LiquidityWithdrawn has copy, drop {
        amount: u64,
        new_reserve: u64,
    }

    public struct UsdcDispensed has copy, drop {
        recipient: address,
        amount: u64,
    }

    public struct UsdcDeposited has copy, drop {
        sender: address,
        amount: u64,
    }

    public struct PoolStatusChanged has copy, drop {
        is_active: bool,
    }

    // === Admin functions ===

    /// Create a new liquidity pool for coin type T
    public fun create_pool<T>(_admin: &AdminCap, ctx: &mut TxContext) {
        let pool = LiquidityPool<T> {
            id: object::new(ctx),
            reserve: balance::zero<T>(),
            total_volume: 0,
            is_active: true,
        };
        transfer::share_object(pool);
    }

    /// Add liquidity to pool
    public fun add_liquidity<T>(
        _admin: &AdminCap,
        pool: &mut LiquidityPool<T>,
        coin: Coin<T>,
    ) {
        let amount = coin.value();
        assert!(amount > 0, E_ZERO_AMOUNT);

        pool.reserve.join(coin.into_balance());
        let new_reserve = pool.reserve.value();

        event::emit(LiquidityAdded { amount, new_reserve });
    }

    /// Withdraw liquidity from pool
    public fun withdraw_liquidity<T>(
        _admin: &AdminCap,
        pool: &mut LiquidityPool<T>,
        amount: u64,
        ctx: &mut TxContext,
    ): Coin<T> {
        assert!(amount > 0, E_ZERO_AMOUNT);
        assert!(pool.reserve.value() >= amount, E_INSUFFICIENT_LIQUIDITY);

        let withdrawn = coin::from_balance(pool.reserve.split(amount), ctx);
        let new_reserve = pool.reserve.value();

        event::emit(LiquidityWithdrawn { amount, new_reserve });
        withdrawn
    }

    /// Dispense USDC to user (for Buy flow after VND payment confirmed)
    public fun dispense<T>(
        _admin: &AdminCap,
        pool: &mut LiquidityPool<T>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        assert!(pool.is_active, E_POOL_INACTIVE);
        assert!(amount > 0, E_ZERO_AMOUNT);
        assert!(pool.reserve.value() >= amount, E_INSUFFICIENT_LIQUIDITY);

        let coin = coin::from_balance(pool.reserve.split(amount), ctx);
        transfer::public_transfer(coin, recipient);

        pool.total_volume = pool.total_volume + amount;

        event::emit(UsdcDispensed { recipient, amount });
    }

    /// Pause/unpause pool
    public fun set_active<T>(
        _admin: &AdminCap,
        pool: &mut LiquidityPool<T>,
        is_active: bool,
    ) {
        pool.is_active = is_active;
        event::emit(PoolStatusChanged { is_active });
    }

    // === Public functions ===

    /// Deposit USDC to pool (for Quick Sell flow)
    public fun deposit<T>(
        pool: &mut LiquidityPool<T>,
        coin: Coin<T>,
        ctx: &mut TxContext,
    ) {
        assert!(pool.is_active, E_POOL_INACTIVE);
        let amount = coin.value();
        assert!(amount > 0, E_ZERO_AMOUNT);

        pool.reserve.join(coin.into_balance());
        pool.total_volume = pool.total_volume + amount;

        event::emit(UsdcDeposited {
            sender: ctx.sender(),
            amount,
        });
    }

    // === View functions ===

    /// Get current reserve balance
    public fun get_reserve<T>(pool: &LiquidityPool<T>): u64 {
        pool.reserve.value()
    }

    /// Get total volume traded
    public fun get_total_volume<T>(pool: &LiquidityPool<T>): u64 {
        pool.total_volume
    }

    /// Check if pool is active
    public fun is_active<T>(pool: &LiquidityPool<T>): bool {
        pool.is_active
    }

    // === Test helpers ===
    #[test_only]
    public fun create_for_testing<T>(ctx: &mut TxContext): LiquidityPool<T> {
        LiquidityPool<T> {
            id: object::new(ctx),
            reserve: balance::zero<T>(),
            total_volume: 0,
            is_active: true,
        }
    }

    #[test_only]
    public fun share_for_testing<T>(pool: LiquidityPool<T>) {
        transfer::share_object(pool);
    }
}
