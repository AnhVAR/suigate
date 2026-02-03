import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Transaction, OrderType } from '../../src/types/transaction.types';
import { TransactionFilterTabs } from '../../src/components/history/transaction-filter-tabs';
import { TransactionListItem } from '../../src/components/history/transaction-list-item';
import { ordersBuySellApiService } from '../../src/api/orders-buy-sell-api-service';
import type { OrderDto } from '@suigate/shared-types';

/** Map backend OrderDto to local Transaction type */
const mapOrderToTransaction = (order: OrderDto): Transaction => ({
  id: order.id,
  type: order.orderType as OrderType,
  amountUsdc: order.amountUsdc ? parseFloat(order.amountUsdc) : 0,
  amountVnd: order.amountVnd || 0,
  rate: order.rate,
  status: order.status as Transaction['status'],
  createdAt: new Date(order.createdAt),
  updatedAt: new Date(order.createdAt),
  targetRate: order.targetRate || undefined,
});

export default function HistoryScreen() {
  const [filter, setFilter] = useState<OrderType | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setError(null);
      const response = await ordersBuySellApiService.listOrders();
      const mapped = response.orders.map(mapOrderToTransaction);
      setTransactions(mapped);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions =
    filter === 'all'
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTransactions();
  };

  const handleTransactionPress = (tx: Transaction) => {
    console.log('Transaction pressed:', tx.id);
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-neutral-500 mt-4">Loading transactions...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center px-5" edges={['top']}>
        <MaterialIcons name="error-outline" size={64} color="#ef4444" />
        <Text className="text-neutral-700 text-lg mt-4">{error}</Text>
        <Text
          className="text-primary-500 font-medium mt-2"
          onPress={fetchTransactions}
        >
          Tap to retry
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <View className="flex-1 px-5">
        {/* Header */}
        <Text className="text-2xl font-bold text-neutral-900 mt-4 mb-4">
          Transaction History
        </Text>

        {/* Filters */}
        <TransactionFilterTabs selected={filter} onSelect={setFilter} />

        {/* Transaction List */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionListItem
              transaction={item}
              onPress={() => handleTransactionPress(item)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <MaterialIcons name="receipt-long" size={64} color="#d1d5db" />
              <Text className="text-neutral-500 text-lg mt-4">No transactions</Text>
              <Text className="text-neutral-400 text-sm mt-1">
                {filter === 'all'
                  ? 'Your transaction history will appear here'
                  : `No ${filter.replace('_', ' ')} transactions found`}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
