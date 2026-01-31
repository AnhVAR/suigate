import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Transaction, OrderType } from '../../src/types/transaction.types';
import { TransactionFilterTabs } from '../../src/components/history/transaction-filter-tabs';
import { TransactionListItem } from '../../src/components/history/transaction-list-item';

// Mock transactions for demo
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'buy',
    amountUsdc: 50,
    amountVnd: 1250000,
    rate: 25000,
    status: 'settled',
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3000000),
  },
  {
    id: '2',
    type: 'quick_sell',
    amountUsdc: 25,
    amountVnd: 618750,
    rate: 24950,
    status: 'processing',
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 7000000),
  },
  {
    id: '3',
    type: 'smart_sell',
    amountUsdc: 100,
    amountVnd: 0,
    rate: 25000,
    targetRate: 26000,
    status: 'pending',
    filledUsdc: 70,
    totalUsdc: 100,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 50000000),
  },
  {
    id: '4',
    type: 'buy',
    amountUsdc: 200,
    amountVnd: 5000000,
    rate: 25000,
    status: 'settled',
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172000000),
  },
];

export default function HistoryScreen() {
  const [filter, setFilter] = useState<OrderType | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions] = useState<Transaction[]>(mockTransactions);

  const filteredTransactions =
    filter === 'all'
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise((r) => setTimeout(r, 1000));
    setIsRefreshing(false);
  };

  const handleTransactionPress = (tx: Transaction) => {
    // TODO: Navigate to transaction detail
    console.log('Transaction pressed:', tx.id);
  };

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
