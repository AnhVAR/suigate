import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../src/stores/authentication-store';
import { useWalletStore } from '../../src/stores/wallet-balance-store';
import { useEffect } from 'react';

export default function WalletScreen() {
  const { suiAddress, logout } = useAuthStore();
  const { usdcBalance, fetchBalance } = useWalletStore();

  useEffect(() => {
    if (suiAddress) {
      fetchBalance(suiAddress);
    }
  }, [suiAddress]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet</Text>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>USDC Balance</Text>
        <Text style={styles.balanceAmount}>${usdcBalance.toFixed(2)}</Text>
      </View>

      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Sui Address</Text>
        <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
          {suiAddress}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  balanceContainer: {
    backgroundColor: '#F2F2F7',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  addressContainer: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'monospace',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
