import { View, ScrollView, RefreshControl, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authentication-store';
import { useWalletStore } from '../../src/stores/wallet-balance-store';
import { BalanceCard } from '../../src/components/wallet/balance-card';
import { QuickActionsGrid } from '../../src/components/wallet/quick-actions-grid';
import { RecentTransactionsList } from '../../src/components/wallet/recent-transactions-list';

export default function WalletScreen() {
  const { suiAddress, canAccessVndFeatures, kycStatus, locationStatus } =
    useAuthStore();
  const { usdcBalance, vndEquivalent, isLoading, fetchBalance } =
    useWalletStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (suiAddress) {
      fetchBalance(suiAddress);
    }
  }, [suiAddress]);

  const handleRefresh = async () => {
    if (!suiAddress) return;
    setIsRefreshing(true);
    await fetchBalance(suiAddress);
    setIsRefreshing(false);
  };

  const canAccessVnd = canAccessVndFeatures();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Wallet</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.section}>
          <BalanceCard
            usdcBalance={usdcBalance}
            vndEquivalent={vndEquivalent}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </View>

        {/* Verification Status Warning */}
        {!canAccessVnd && (
          <View style={styles.warningCard}>
            <View style={styles.warningIcon}>
              <Text style={styles.warningIconText}>!</Text>
            </View>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Limited Access</Text>
              <Text style={styles.warningText}>
                {kycStatus !== 'verified' && 'Complete KYC verification. '}
                {locationStatus !== 'within_sandbox' &&
                  'Verify location in sandbox zone.'}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickActionsGrid canAccessVnd={canAccessVnd} />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <RecentTransactionsList transactions={[]} isLoading={isLoading} />
        </View>

        {/* Address Display */}
        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>Wallet Address</Text>
          <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
            {suiAddress}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 16,
  },
  warningCard: {
    backgroundColor: '#fef9c3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#fde68a',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  warningIconText: {
    color: '#ca8a04',
    fontWeight: '700',
    fontSize: 16,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 4,
  },
  warningText: {
    color: '#4b5563',
    fontSize: 14,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  addressLabel: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 4,
  },
  addressText: {
    color: '#1f2937',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
