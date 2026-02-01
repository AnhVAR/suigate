export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY,
  },
  encryption: {
    key: process.env.DB_ENCRYPTION_KEY,
  },
  sui: {
    rpcUrl: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io',
    packageId: process.env.SUI_PACKAGE_ID,
    adminCapId: process.env.SUI_ADMIN_CAP_ID,
    oracleId: process.env.SUI_ORACLE_ID,
    poolId: process.env.SUI_POOL_ID,
    usdcType:
      process.env.SUI_USDC_TYPE ||
      '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
    adminSecretKey: process.env.SUI_ADMIN_SECRET_KEY,
  },
  auth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    appleClientId: process.env.APPLE_CLIENT_ID,
  },
  sepay: {
    webhookSecret: process.env.SEPAY_WEBHOOK_SECRET || 'mock-secret',
    accountNumber: process.env.SEPAY_ACCOUNT_NUMBER || '0123456789',
    accountName: process.env.SEPAY_ACCOUNT_NAME || 'SUIGATE',
  },
});
