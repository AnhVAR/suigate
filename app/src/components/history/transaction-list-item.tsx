import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Transaction } from '../../types/transaction.types';
import { StatusBadge } from '../feedback/status-badge';
import { SmartSellProgress } from './smart-sell-progress';

interface TransactionListItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

const getTypeConfig = (type: Transaction['type']) => {
  switch (type) {
    case 'buy':
      return { label: 'Buy USDC', icon: 'add-circle', color: '#10b981', prefix: '+' };
    case 'quick_sell':
      return { label: 'Quick Sell', icon: 'flash-on', color: '#ef4444', prefix: '-' };
    case 'smart_sell':
      return { label: 'Smart Sell', icon: 'trending-up', color: '#8b5cf6', prefix: '-' };
  }
};

const formatDate = (date: Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatVnd = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

const mapStatus = (status: Transaction['status']) => {
  switch (status) {
    case 'pending':
    case 'paid':
      return 'pending';
    case 'processing':
      return 'processing';
    case 'settled':
      return 'success';
    case 'cancelled':
      return 'cancelled';
    case 'failed':
      return 'failed';
    default:
      return 'pending';
  }
};

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  transaction,
  onPress,
}) => {
  const config = getTypeConfig(transaction.type);
  const isSmartSell = transaction.type === 'smart_sell';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 border border-neutral-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        {/* Icon */}
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <MaterialIcons name={config.icon as any} size={20} color={config.color} />
        </View>

        {/* Details */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <View>
              <Text className="text-neutral-900 font-medium">{config.label}</Text>
              <Text className="text-neutral-500 text-xs">
                {formatDate(transaction.createdAt)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-neutral-900 font-semibold">
                {config.prefix}{transaction.amountUsdc.toFixed(2)} USDC
              </Text>
              <Text className="text-neutral-500 text-xs">
                {formatVnd(transaction.amountVnd)} VND
              </Text>
            </View>
          </View>

          {/* Status & Rate */}
          <View className="flex-row justify-between items-center mt-2">
            <StatusBadge status={mapStatus(transaction.status)} size="sm" />
            <Text className="text-neutral-400 text-xs">
              Rate: {transaction.rate.toLocaleString('vi-VN')}
              {isSmartSell && transaction.targetRate && ` (Target: ${transaction.targetRate.toLocaleString('vi-VN')})`}
            </Text>
          </View>

          {/* Smart Sell Progress */}
          {isSmartSell && transaction.filledUsdc !== undefined && transaction.totalUsdc !== undefined && (
            <SmartSellProgress
              filledUsdc={transaction.filledUsdc}
              totalUsdc={transaction.totalUsdc}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
