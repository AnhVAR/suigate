/**
 * Rate Display Component
 * Shows current VND/USDC exchange rate with refresh button
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RateDisplayProps {
  rate: number;
  isLoading?: boolean;
  onRefresh?: () => void;
  showRefresh?: boolean;
}

const formatRate = (rate: number): string => {
  return rate.toLocaleString('vi-VN');
};

export const RateDisplay: React.FC<RateDisplayProps> = ({
  rate,
  isLoading,
  onRefresh,
  showRefresh = true,
}) => {
  return (
    <View className="flex-row items-center justify-between bg-neutral-50 rounded-lg px-4 py-3">
      <View className="flex-row items-center">
        <MaterialIcons name="currency-exchange" size={18} color="#6b7280" />
        <Text className="text-neutral-600 ml-2">Rate:</Text>
      </View>

      <View className="flex-row items-center">
        {isLoading ? (
          <ActivityIndicator size="small" color="#8b5cf6" />
        ) : (
          <Text className="text-neutral-900 font-semibold">
            1 USDC = {formatRate(rate)} VND
          </Text>
        )}

        {showRefresh && onRefresh && (
          <TouchableOpacity
            onPress={onRefresh}
            disabled={isLoading}
            className="ml-2"
          >
            <MaterialIcons name="refresh" size={18} color="#8b5cf6" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
