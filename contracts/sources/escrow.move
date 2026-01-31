/// Escrow - Lock USDC for Smart Sell orders with target rate condition
/// User creates escrow, backend executes when oracle rate meets target
module suigate::escrow {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::Clock;
    use sui::event;
    use suigate::admin_cap::AdminCap;
    use suigate::price_oracle::{Self, PriceOracle};

    // === Errors ===
    const E_NOT_OWNER: u64 = 0;
    const E_RATE_NOT_MET: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_ZERO_AMOUNT: u64 = 3;

    /// Escrow for Smart Sell orders
    public struct Escrow<phantom T> has key, store {
        id: UID,
        owner: address,
        balance: Balance<T>,
        target_rate: u64,       // VND per USDC - execute when sell_rate >= target
        bank_account_id: u64,   // Off-chain reference for VND disbursement
        created_at: u64,
    }

    // === Events ===
    public struct EscrowCreated has copy, drop {
        escrow_id: ID,
        owner: address,
        amount: u64,
        target_rate: u64,
        bank_account_id: u64,
    }

    public struct EscrowExecuted has copy, drop {
        escrow_id: ID,
        amount: u64,
        rate: u64,
        recipient: address,
    }

    public struct EscrowCancelled has copy, drop {
        escrow_id: ID,
        amount: u64,
        owner: address,
    }

    public struct EscrowPartialFill has copy, drop {
        escrow_id: ID,
        fill_amount: u64,
        remaining: u64,
        rate: u64,
    }

    // === Public functions ===

    /// Create escrow with USDC locked at target rate
    public fun create_escrow<T>(
        coin: Coin<T>,
        target_rate: u64,
        bank_account_id: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ): Escrow<T> {
        let amount = coin.value();
        assert!(amount > 0, E_ZERO_AMOUNT);

        let escrow = Escrow<T> {
            id: object::new(ctx),
            owner: ctx.sender(),
            balance: coin.into_balance(),
            target_rate,
            bank_account_id,
            created_at: clock.timestamp_ms(),
        };

        event::emit(EscrowCreated {
            escrow_id: object::uid_to_inner(&escrow.id),
            owner: escrow.owner,
            amount,
            target_rate,
            bank_account_id,
        });

        escrow
    }

    /// Create and transfer escrow to owner (convenience function)
    public fun create_and_transfer<T>(
        coin: Coin<T>,
        target_rate: u64,
        bank_account_id: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let escrow = create_escrow(coin, target_rate, bank_account_id, clock, ctx);
        transfer::transfer(escrow, ctx.sender());
    }

    /// Cancel escrow - owner only, returns USDC
    public fun cancel_escrow<T>(
        escrow: Escrow<T>,
        ctx: &mut TxContext,
    ): Coin<T> {
        assert!(ctx.sender() == escrow.owner, E_NOT_OWNER);

        let Escrow { id, owner, balance, target_rate: _, bank_account_id: _, created_at: _ } = escrow;
        let amount = balance.value();
        let escrow_id = object::uid_to_inner(&id);
        object::delete(id);

        event::emit(EscrowCancelled { escrow_id, amount, owner });

        coin::from_balance(balance, ctx)
    }

    /// Cancel and return USDC to owner (convenience function)
    public fun cancel_and_return<T>(
        escrow: Escrow<T>,
        ctx: &mut TxContext,
    ) {
        let coin = cancel_escrow(escrow, ctx);
        transfer::public_transfer(coin, ctx.sender());
    }

    // === Admin functions ===

    /// Execute escrow when rate target is met - admin only
    /// Validates current sell_rate >= target_rate from oracle
    public fun execute_escrow<T>(
        _admin: &AdminCap,
        escrow: Escrow<T>,
        oracle: &PriceOracle,
        clock: &Clock,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let current_rate = price_oracle::get_sell_rate(oracle, clock);
        assert!(current_rate >= escrow.target_rate, E_RATE_NOT_MET);

        let Escrow { id, owner: _, balance, target_rate: _, bank_account_id: _, created_at: _ } = escrow;
        let amount = balance.value();
        let escrow_id = object::uid_to_inner(&id);
        object::delete(id);

        let coin = coin::from_balance(balance, ctx);
        transfer::public_transfer(coin, recipient);

        event::emit(EscrowExecuted {
            escrow_id,
            amount,
            rate: current_rate,
            recipient,
        });
    }

    /// Partial fill of escrow - admin only
    public fun partial_fill<T>(
        _admin: &AdminCap,
        escrow: &mut Escrow<T>,
        fill_amount: u64,
        oracle: &PriceOracle,
        clock: &Clock,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let current_rate = price_oracle::get_sell_rate(oracle, clock);
        assert!(current_rate >= escrow.target_rate, E_RATE_NOT_MET);
        assert!(fill_amount > 0, E_ZERO_AMOUNT);
        assert!(escrow.balance.value() >= fill_amount, E_INSUFFICIENT_BALANCE);

        let coin = coin::from_balance(escrow.balance.split(fill_amount), ctx);
        transfer::public_transfer(coin, recipient);

        let remaining = escrow.balance.value();

        event::emit(EscrowPartialFill {
            escrow_id: object::uid_to_inner(&escrow.id),
            fill_amount,
            remaining,
            rate: current_rate,
        });
    }

    // === View functions ===

    /// Get escrow info
    public fun get_info<T>(escrow: &Escrow<T>): (address, u64, u64, u64, u64) {
        (escrow.owner, escrow.balance.value(), escrow.target_rate, escrow.bank_account_id, escrow.created_at)
    }

    /// Get escrow balance
    public fun get_balance<T>(escrow: &Escrow<T>): u64 {
        escrow.balance.value()
    }

    /// Get escrow owner
    public fun get_owner<T>(escrow: &Escrow<T>): address {
        escrow.owner
    }

    /// Get target rate
    public fun get_target_rate<T>(escrow: &Escrow<T>): u64 {
        escrow.target_rate
    }
}
