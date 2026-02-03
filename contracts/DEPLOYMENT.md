# SuiGate Smart Contracts - Testnet Deployment

**Deployed:** 2026-01-31
**Network:** Sui Testnet
**Transaction:** `7vrtAGLuaoghXNzYoQ4WxT2zrjXq8HjW1Qyw8q6ZQaxd`

## Package Info

| Key | Value |
|-----|-------|
| **Package ID** | `0xa0293d10661a51dadbed27335bb79de99f572a0e216502ffb39865312b92d828` |
| **Modules** | admin_cap, escrow, liquidity_pool, price_oracle |

## Created Objects

| Object | Type | ID |
|--------|------|-----|
| **PriceOracle** | Shared | `0x72b8d9bd259d68b7a5d50fd478d996d44d3ce73c231dde58c35211e6d9e80300` |
| **AdminCap** | Owned | `0xb804ead27f8adf5d0e693b931b971697a64f49747ceea1b8ba687de1879f0557` |
| **UpgradeCap** | Owned | `0x7825366cdfcdef63e10ea4ab52b307b7121c44ed1d78fae47d1c70cab70a495d` |

## Admin Address

`0xcb4bd77a35d80ef94eaf8a2c5dee82052e358626b06bee1154570152c185e5d8`

## USDC (Testnet)

```
0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC
```

| **LiquidityPool (USDC)** | Shared | `0x4abfd52ee4a3f5379bc74c46851370edd93f240afe7c9c04d31fd77b8ee81e29` |
| **LiquidityPool (TEST_USDC)** | Shared | `0xe0f7eb856e2fba778e75863289851cebd7ec38e7af27321e70fda7d117d0d5c0` |

## TEST_USDC (for development)

```
0xfda5e7d874aee36569b18e6df8c62693e93c8dfa76e317543aa9bb827ed91d13::test_usdc::TEST_USDC
```

## Next Steps

1. ~~Create USDC LiquidityPool via `liquidity_pool::create_pool<USDC>`~~ ✅ Done
2. ~~Create TEST_USDC LiquidityPool for development~~ ✅ Done (10,000 TEST_USDC deposited)
3. Update PriceOracle with VND/USDC rates via `price_oracle::update_rates`
4. Integrate with backend API

## Explorer Links

- [Package](https://suiscan.xyz/testnet/object/0xa0293d10661a51dadbed27335bb79de99f572a0e216502ffb39865312b92d828)
- [Transaction](https://suiscan.xyz/testnet/tx/7vrtAGLuaoghXNzYoQ4WxT2zrjXq8HjW1Qyw8q6ZQaxd)
