/**
 * Fee Comparison Card Component
 * Compares Quick Sell vs Smart Sell fees and savings
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FeeComparisonCardProps {
  quickSellVnd: number;
  smartSellVnd: number;
  savings: number;
}

const formatVnd = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

export const FeeComparisonCard: React.FC<FeeComparisonCardProps> = ({
  quickSellVnd,
  smartSellVnd,
  savings,
}) => {
  const hasSavings = savings > 0;

  return (
    <View className="bg-neutral-50 rounded-xl p-4">
      <Text className="text-neutral-700 font-semibold mb-3">Comparison</Text>

      {/* Quick Sell */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <View className="w-6 h-6 bg-neutral-200 rounded-full items-center justify-center mr-2">
            <MaterialIcons name="flash-on" size={14} color="#6b7280" />
          </View>
          <Text className="text-neutral-600">Quick Sell (0.5% fee)</Text>
        </View>
        <Text className="text-neutral-600">{formatVnd(quickSellVnd)} VND</Text>
      </View>

      {/* Smart Sell */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <View className="w-6 h-6 bg-primary-100 rounded-full items-center justify-center mr-2">
            <MaterialIcons name="trending-up" size={14} color="#8b5cf6" />
          </View>
          <Text className="text-neutral-900 font-medium">
            Smart Sell (0.2% fee)
          </Text>
        </View>
        <Text className="text-neutral-900 font-semibold">
          {formatVnd(smartSellVnd)} VND
        </Text>
      </View>

      {/* Divider */}
      <View className="h-px bg-neutral-200 mb-3" />

      {/* Savings */}
      <View className="flex-row justify-between items-center">
        <Text
          className={hasSavings ? 'text-green-600 font-medium' : 'text-neutral-600'}
        >
          {hasSavings ? 'You save' : 'Difference'}
        </Text>
        <View className="flex-row items-center">
          {hasSavings && (
            <MaterialIcons name="arrow-upward" size={16} color="#22c55e" />
          )}
          <Text
            className={`font-semibold ${
              hasSavings ? 'text-green-600' : 'text-neutral-600'
            }`}
          >
            {hasSavings ? '+' : ''}
            {formatVnd(Math.abs(savings))} VND
          </Text>
        </View>
      </View>
    </View>
  );
};
