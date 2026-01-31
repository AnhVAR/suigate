import React from 'react';
import { View, Text } from 'react-native';

interface SmartSellProgressProps {
  filledUsdc: number;
  totalUsdc: number;
}

export const SmartSellProgress: React.FC<SmartSellProgressProps> = ({
  filledUsdc,
  totalUsdc,
}) => {
  const percentage = totalUsdc > 0 ? (filledUsdc / totalUsdc) * 100 : 0;

  return (
    <View className="mt-2">
      <View className="flex-row justify-between mb-1">
        <Text className="text-xs text-neutral-500">Fill Progress</Text>
        <Text className="text-xs text-neutral-700 font-medium">
          {filledUsdc}/{totalUsdc} USDC ({Math.round(percentage)}%)
        </Text>
      </View>
      <View className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-primary-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
};
