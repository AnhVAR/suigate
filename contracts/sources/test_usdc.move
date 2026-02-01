/// TestUSDC - Simple test stablecoin for hackathon demo
module suigate::test_usdc {
    use sui::coin::{Self, TreasuryCap};

    public struct TEST_USDC has drop {}

    fun init(witness: TEST_USDC, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            6,
            b"tUSDC",
            b"Test USDC",
            b"Test USDC for SuiGate demo",
            option::none(),
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, ctx.sender());
    }

    public entry fun mint(
        treasury: &mut TreasuryCap<TEST_USDC>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        transfer::public_transfer(coin::mint(treasury, amount, ctx), recipient);
    }
}
