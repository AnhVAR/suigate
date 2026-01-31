/// Integration tests for SuiGate smart contracts
#[test_only]
module suigate::suigate_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use suigate::admin_cap::{Self, AdminCap};
    use suigate::price_oracle::{Self, PriceOracle};
    use suigate::liquidity_pool::{Self, LiquidityPool};
    use suigate::escrow::{Self, Escrow};

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER: address = @0xB0B;
    const PLATFORM: address = @0xCAFE;

    // Test values
    const MID_RATE: u64 = 25000;  // 25,000 VND per USDC
    const SPREAD_BPS: u64 = 50;   // 0.5%
    const TEST_AMOUNT: u64 = 1_000_000; // 1 USDC (6 decimals)

    // === Helper functions ===

    fun setup_admin(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            let ctx = ts::ctx(scenario);
            let cap = admin_cap::create_for_testing(ctx);
            transfer::public_transfer(cap, ADMIN);
        };
    }

    fun setup_clock(scenario: &mut Scenario): Clock {
        ts::next_tx(scenario, ADMIN);
        clock::create_for_testing(ts::ctx(scenario))
    }

    fun setup_oracle(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            let ctx = ts::ctx(scenario);
            let oracle = price_oracle::create_for_testing(ctx);
            price_oracle::share_for_testing(oracle);
        };
    }

    fun setup_pool(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            let ctx = ts::ctx(scenario);
            let pool = liquidity_pool::create_for_testing<SUI>(ctx);
            liquidity_pool::share_for_testing(pool);
        };
    }

    fun mint_coin(scenario: &mut Scenario, amount: u64): Coin<SUI> {
        coin::mint_for_testing<SUI>(amount, ts::ctx(scenario))
    }

    // === AdminCap Tests ===

    #[test]
    fun test_admin_cap_creation() {
        let mut scenario = ts::begin(ADMIN);
        setup_admin(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(ts::has_most_recent_for_sender<AdminCap>(&scenario), 0);
        };

        ts::end(scenario);
    }

    // === PriceOracle Tests ===

    #[test]
    fun test_oracle_update_rates() {
        let mut scenario = ts::begin(ADMIN);
        setup_admin(&mut scenario);
        setup_oracle(&mut scenario);
        let mut clock = setup_clock(&mut scenario);

        // Set clock to current time
        clock::set_for_testing(&mut clock, 1000000);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut oracle = ts::take_shared<PriceOracle>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);

            price_oracle::update_rates(&cap, &mut oracle, MID_RATE, SPREAD_BPS, &clock);

            // Verify rates calculated correctly
            // buy_rate = 25000 * 10050 / 10000 = 25125
            // sell_rate = 25000 * 9950 / 10000 = 24875
            let buy_rate = price_oracle::get_buy_rate(&oracle, &clock);
            let sell_rate = price_oracle::get_sell_rate(&oracle, &clock);

            assert!(buy_rate == 25125, 1);
            assert!(sell_rate == 24875, 2);

            ts::return_shared(oracle);
            ts::return_to_sender(&scenario, cap);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = price_oracle::E_STALE_PRICE)]
    fun test_oracle_stale_price_fails() {
        let mut scenario = ts::begin(ADMIN);
        setup_admin(&mut scenario);
        setup_oracle(&mut scenario);
        let mut clock = setup_clock(&mut scenario);

        // Set initial time and update rates
        clock::set_for_testing(&mut clock, 1000000);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut oracle = ts::take_shared<PriceOracle>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            price_oracle::update_rates(&cap, &mut oracle, MID_RATE, SPREAD_BPS, &clock);
            ts::return_shared(oracle);
            ts::return_to_sender(&scenario, cap);
        };

        // Advance clock beyond staleness threshold (10 min = 600,000 ms)
        clock::set_for_testing(&mut clock, 1000000 + 700000);

        ts::next_tx(&mut scenario, USER);
        {
            let oracle = ts::take_shared<PriceOracle>(&scenario);
            // This should fail with E_STALE_PRICE
            let _ = price_oracle::get_buy_rate(&oracle, &clock);
            ts::return_shared(oracle);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // === LiquidityPool Tests ===

    #[test]
    fun test_pool_add_and_dispense() {
        let mut scenario = ts::begin(ADMIN);
        setup_admin(&mut scenario);
        setup_pool(&mut scenario);

        // Add liquidity
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut pool = ts::take_shared<LiquidityPool<SUI>>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let coin = mint_coin(&mut scenario, TEST_AMOUNT);

            liquidity_pool::add_liquidity(&cap, &mut pool, coin);

            assert!(liquidity_pool::get_reserve(&pool) == TEST_AMOUNT, 1);

            ts::return_shared(pool);
            ts::return_to_sender(&scenario, cap);
        };

        // Dispense to user
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut pool = ts::take_shared<LiquidityPool<SUI>>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);

            liquidity_pool::dispense(&cap, &mut pool, TEST_AMOUNT / 2, USER, ts::ctx(&mut scenario));

            assert!(liquidity_pool::get_reserve(&pool) == TEST_AMOUNT / 2, 2);
            assert!(liquidity_pool::get_total_volume(&pool) == TEST_AMOUNT / 2, 3);

            ts::return_shared(pool);
            ts::return_to_sender(&scenario, cap);
        };

        // Verify user received coins
        ts::next_tx(&mut scenario, USER);
        {
            assert!(ts::has_most_recent_for_sender<Coin<SUI>>(&scenario), 4);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_pool_deposit() {
        let mut scenario = ts::begin(ADMIN);
        setup_admin(&mut scenario);
        setup_pool(&mut scenario);

        // User deposits (Quick Sell flow)
        ts::next_tx(&mut scenario, USER);
        {
            let mut pool = ts::take_shared<LiquidityPool<SUI>>(&scenario);
            let coin = mint_coin(&mut scenario, TEST_AMOUNT);

            liquidity_pool::deposit(&mut pool, coin, ts::ctx(&mut scenario));

            assert!(liquidity_pool::get_reserve(&pool) == TEST_AMOUNT, 1);
            assert!(liquidity_pool::get_total_volume(&pool) == TEST_AMOUNT, 2);

            ts::return_shared(pool);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = liquidity_pool::E_POOL_INACTIVE)]
    fun test_pool_inactive_deposit_fails() {
        let mut scenario = ts::begin(ADMIN);
        setup_admin(&mut scenario);
        setup_pool(&mut scenario);

        // Pause pool
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut pool = ts::take_shared<LiquidityPool<SUI>>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);

            liquidity_pool::set_active(&cap, &mut pool, false);

            ts::return_shared(pool);
            ts::return_to_sender(&scenario, cap);
        };

        // Try to deposit while paused
        ts::next_tx(&mut scenario, USER);
        {
            let mut pool = ts::take_shared<LiquidityPool<SUI>>(&scenario);
            let coin = mint_coin(&mut scenario, TEST_AMOUNT);

            // This should fail with E_POOL_INACTIVE
            liquidity_pool::deposit(&mut pool, coin, ts::ctx(&mut scenario));

            ts::return_shared(pool);
        };

        ts::end(scenario);
    }

    // === Escrow Tests ===

    #[test]
    fun test_escrow_create_and_cancel() {
        let mut scenario = ts::begin(USER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000000);

        // Create escrow
        ts::next_tx(&mut scenario, USER);
        {
            let coin = mint_coin(&mut scenario, TEST_AMOUNT);
            let escrow = escrow::create_escrow(coin, 26000, 1, &clock, ts::ctx(&mut scenario));

            assert!(escrow::get_balance(&escrow) == TEST_AMOUNT, 1);
            assert!(escrow::get_target_rate(&escrow) == 26000, 2);
            assert!(escrow::get_owner(&escrow) == USER, 3);

            transfer::public_transfer(escrow, USER);
        };

        // Cancel escrow
        ts::next_tx(&mut scenario, USER);
        {
            let escrow = ts::take_from_sender<Escrow<SUI>>(&scenario);
            let coin = escrow::cancel_escrow(escrow, ts::ctx(&mut scenario));

            assert!(coin.value() == TEST_AMOUNT, 4);
            coin::burn_for_testing(coin);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = escrow::E_NOT_OWNER)]
    fun test_escrow_cancel_not_owner_fails() {
        let mut scenario = ts::begin(USER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000000);

        // User creates escrow
        ts::next_tx(&mut scenario, USER);
        {
            let coin = mint_coin(&mut scenario, TEST_AMOUNT);
            let escrow = escrow::create_escrow(coin, 26000, 1, &clock, ts::ctx(&mut scenario));
            transfer::public_transfer(escrow, USER);
        };

        // Another user tries to cancel
        ts::next_tx(&mut scenario, ADMIN);
        {
            let escrow = ts::take_from_address<Escrow<SUI>>(&scenario, USER);
            // This should fail with E_NOT_OWNER
            let coin = escrow::cancel_escrow(escrow, ts::ctx(&mut scenario));
            coin::burn_for_testing(coin);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_escrow_execute_when_rate_met() {
        let mut scenario = ts::begin(ADMIN);
        setup_admin(&mut scenario);
        setup_oracle(&mut scenario);
        let mut clock = setup_clock(&mut scenario);
        clock::set_for_testing(&mut clock, 1000000);

        // Update oracle with rate that meets target
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut oracle = ts::take_shared<PriceOracle>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            // sell_rate will be 24875
            price_oracle::update_rates(&cap, &mut oracle, MID_RATE, SPREAD_BPS, &clock);
            ts::return_shared(oracle);
            ts::return_to_sender(&scenario, cap);
        };

        // User creates escrow with target_rate <= sell_rate
        ts::next_tx(&mut scenario, USER);
        {
            let coin = mint_coin(&mut scenario, TEST_AMOUNT);
            // Target rate 24000 < sell_rate 24875, so execution should succeed
            let escrow = escrow::create_escrow(coin, 24000, 1, &clock, ts::ctx(&mut scenario));
            transfer::public_transfer(escrow, USER);
        };

        // Admin executes escrow
        ts::next_tx(&mut scenario, ADMIN);
        {
            let oracle = ts::take_shared<PriceOracle>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let escrow = ts::take_from_address<Escrow<SUI>>(&scenario, USER);

            escrow::execute_escrow(&cap, escrow, &oracle, &clock, PLATFORM, ts::ctx(&mut scenario));

            ts::return_shared(oracle);
            ts::return_to_sender(&scenario, cap);
        };

        // Verify platform received funds
        ts::next_tx(&mut scenario, PLATFORM);
        {
            assert!(ts::has_most_recent_for_sender<Coin<SUI>>(&scenario), 1);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = escrow::E_RATE_NOT_MET)]
    fun test_escrow_execute_rate_not_met_fails() {
        let mut scenario = ts::begin(ADMIN);
        setup_admin(&mut scenario);
        setup_oracle(&mut scenario);
        let mut clock = setup_clock(&mut scenario);
        clock::set_for_testing(&mut clock, 1000000);

        // Update oracle
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut oracle = ts::take_shared<PriceOracle>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            // sell_rate will be 24875
            price_oracle::update_rates(&cap, &mut oracle, MID_RATE, SPREAD_BPS, &clock);
            ts::return_shared(oracle);
            ts::return_to_sender(&scenario, cap);
        };

        // User creates escrow with target_rate > sell_rate
        ts::next_tx(&mut scenario, USER);
        {
            let coin = mint_coin(&mut scenario, TEST_AMOUNT);
            // Target rate 26000 > sell_rate 24875, so execution should fail
            let escrow = escrow::create_escrow(coin, 26000, 1, &clock, ts::ctx(&mut scenario));
            transfer::public_transfer(escrow, USER);
        };

        // Admin tries to execute but rate not met
        ts::next_tx(&mut scenario, ADMIN);
        {
            let oracle = ts::take_shared<PriceOracle>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let escrow = ts::take_from_address<Escrow<SUI>>(&scenario, USER);

            // This should fail with E_RATE_NOT_MET
            escrow::execute_escrow(&cap, escrow, &oracle, &clock, PLATFORM, ts::ctx(&mut scenario));

            ts::return_shared(oracle);
            ts::return_to_sender(&scenario, cap);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_escrow_partial_fill() {
        let mut scenario = ts::begin(ADMIN);
        setup_admin(&mut scenario);
        setup_oracle(&mut scenario);
        let mut clock = setup_clock(&mut scenario);
        clock::set_for_testing(&mut clock, 1000000);

        // Update oracle
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut oracle = ts::take_shared<PriceOracle>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            price_oracle::update_rates(&cap, &mut oracle, MID_RATE, SPREAD_BPS, &clock);
            ts::return_shared(oracle);
            ts::return_to_sender(&scenario, cap);
        };

        // User creates escrow
        ts::next_tx(&mut scenario, USER);
        {
            let coin = mint_coin(&mut scenario, TEST_AMOUNT);
            let escrow = escrow::create_escrow(coin, 24000, 1, &clock, ts::ctx(&mut scenario));
            transfer::public_transfer(escrow, USER);
        };

        // Admin partial fills
        ts::next_tx(&mut scenario, ADMIN);
        {
            let oracle = ts::take_shared<PriceOracle>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut escrow = ts::take_from_address<Escrow<SUI>>(&scenario, USER);

            escrow::partial_fill(&cap, &mut escrow, TEST_AMOUNT / 2, &oracle, &clock, PLATFORM, ts::ctx(&mut scenario));

            assert!(escrow::get_balance(&escrow) == TEST_AMOUNT / 2, 1);

            ts::return_shared(oracle);
            ts::return_to_sender(&scenario, cap);
            transfer::public_transfer(escrow, USER);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}
