import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BalanceCardProps {
  usdcBalance: number;
  vndEquivalent: number;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const formatUsdc = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatVnd = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

export const BalanceCard: React.FC<BalanceCardProps> = ({
  usdcBalance,
  vndEquivalent,
  isLoading,
  onRefresh,
}) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>Total Balance</Text>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} disabled={isLoading}>
            <MaterialIcons name="refresh" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        )}
      </View>

      {/* USDC Balance */}
      <View style={styles.balanceRow}>
        {isLoading ? (
          <View style={styles.skeleton} />
        ) : (
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{formatUsdc(usdcBalance)}</Text>
            <Text style={styles.currency}>USDC</Text>
          </View>
        )}
      </View>

      {/* VND Equivalent */}
      <View style={styles.equivalentRow}>
        <MaterialIcons name="swap-vert" size={16} color="rgba(255,255,255,0.6)" />
        {isLoading ? (
          <View style={styles.skeletonSmall} />
        ) : (
          <Text style={styles.equivalent}>
            {'\u2248'} {formatVnd(vndEquivalent)} VND
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    color: '#ddd6fe',
    fontSize: 14,
  },
  balanceRow: {
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amount: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '700',
  },
  currency: {
    color: '#ddd6fe',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  equivalentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equivalent: {
    color: '#ddd6fe',
    fontSize: 16,
    marginLeft: 4,
  },
  skeleton: {
    height: 56,
    backgroundColor: '#a78bfa',
    borderRadius: 8,
  },
  skeletonSmall: {
    height: 20,
    width: 128,
    backgroundColor: '#a78bfa',
    borderRadius: 4,
    marginLeft: 4,
  },
});
