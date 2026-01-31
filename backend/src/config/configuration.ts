export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_ANON_KEY || '',
  },
  sui: {
    rpcUrl: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io',
  },
});
