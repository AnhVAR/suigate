/// AdminCap - Capability pattern for privileged operations
/// Grants admin access to update oracle, manage liquidity pool, execute escrows
module suigate::admin_cap {
    /// Admin capability object - holder can perform admin operations
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Create AdminCap and transfer to deployer
    fun init(ctx: &mut TxContext) {
        let cap = AdminCap { id: object::new(ctx) };
        transfer::transfer(cap, ctx.sender());
    }

    // === Test helpers ===
    #[test_only]
    public fun create_for_testing(ctx: &mut TxContext): AdminCap {
        AdminCap { id: object::new(ctx) }
    }
}
