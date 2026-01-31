import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBadge } from '../feedback/status-badge';

export interface Transaction {
  id: string;
  type: 'buy' | 'quick_sell' | 'smart_sell';
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  timestamp: Date;
}

interface RecentTransactionsListProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const getTypeConfig = (type: Transaction['type']) => {
  switch (type) {
    case 'buy':
      return { label: 'Buy USDC', icon: 'add-circle' as const, color: '#10b981' };
    case 'quick_sell':
      return { label: 'Quick Sell', icon: 'flash-on' as const, color: '#ef4444' };
    case 'smart_sell':
      return { label: 'Smart Sell', icon: 'trending-up' as const, color: '#8b5cf6' };
  }
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / 3600000);
  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  transactions = [],
  isLoading,
}) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.headerTitle}>Recent Activity</Text>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.skeletonRow}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonText}>
              <View style={[styles.skeletonLine, { width: 96 }]} />
              <View style={[styles.skeletonLine, { width: 64, marginTop: 8 }]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <MaterialIcons name="receipt-long" size={48} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No transactions yet</Text>
        <Text style={styles.emptySubtitle}>Your activity will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {transactions.slice(0, 3).map((tx, index) => {
        const config = getTypeConfig(tx.type);
        const isLast = index === Math.min(2, transactions.length - 1);

        return (
          <View key={tx.id} style={[styles.row, !isLast && styles.rowBorder]}>
            <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
              <MaterialIcons name={config.icon} size={20} color={config.color} />
            </View>
            <View style={styles.details}>
              <Text style={styles.txLabel}>{config.label}</Text>
              <Text style={styles.txTime}>{formatTime(tx.timestamp)}</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.txAmount}>
                {tx.type === 'buy' ? '+' : '-'}{tx.amount} USDC
              </Text>
              <StatusBadge status={tx.status} size="sm" />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 16,
  },
  viewAll: {
    color: '#8b5cf6',
    fontWeight: '500',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  txLabel: {
    color: '#1f2937',
    fontWeight: '500',
  },
  txTime: {
    color: '#6b7280',
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    color: '#1f2937',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#6b7280',
    marginTop: 8,
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 14,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  skeletonText: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
});
