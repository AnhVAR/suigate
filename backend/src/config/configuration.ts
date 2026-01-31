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
    rpcUrl: process.env.SUI_RPC_URL || 'https://fullnode.mainnet.sui.io',
    usdcType:
      process.env.SUI_USDC_TYPE ||
      '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
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
