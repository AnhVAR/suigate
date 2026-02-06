/**
 * Smart Sell Progress Card
 * Shows progress of smart sell order with fill history and cancel option
 */
import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { SmartSellOrderDto, FillHistoryItem } from '@suigate/shared-types';

interface SmartSellProgressCardProps {
  order: SmartSellOrderDto;
  onCancel: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const SmartSellProgressCard: React.FC<SmartSellProgressCardProps> = ({
  order,
  onCancel,
  onRefresh,
  isLoading = false,
}) => {
  const amountUsdc = order.amountUsdc ? parseFloat(order.amountUsdc) : 0;
  const filledUsdc = order.filledUsdc || 0;
  const remainingUsdc = order.remainingUsdc || amountUsdc - filledUsdc;
  const progress = amountUsdc > 0 ? filledUsdc / amountUsdc : 0;
  const isActive = order.status === 'processing';

  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-neutral-100">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <MaterialIcons name="trending-up" size={20} color="#8b5cf6" />
          <Text className="font-semibold text-neutral-900 ml-2">
            Smart Sell #{order.id.slice(0, 8)}
          </Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {/* Amount & Rate */}
      <View className="mb-3">
        <Text className="text-lg font-bold text-neutral-900">
          {amountUsdc.toFixed(2)} USDC
        </Text>
        <Text className="text-sm text-neutral-500">
          Target: {order.targetRate?.toLocaleString('vi-VN')} VND
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="mb-2">
        <View className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
      </View>

      {/* Filled / Remaining */}
      <View className="flex-row justify-between mb-4">
        <Text className="text-sm text-neutral-500">
          Filled: {filledUsdc.toFixed(2)} USDC
        </Text>
        <Text className="text-sm text-neutral-500">
          Remaining: {remainingUsdc.toFixed(2)} USDC
        </Text>
      </View>

      {/* Fill History */}
      {order.fillHistory && order.fillHistory.length > 0 && (
        <FillHistoryList fills={order.fillHistory} />
      )}

      {/* Actions */}
      <View className="flex-row gap-2 mt-4">
        {/* Refresh Button */}
        <Pressable
          onPress={onRefresh}
          disabled={isLoading}
          className="flex-1 py-3 border border-neutral-200 rounded-lg flex-row justify-center items-center"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#8b5cf6" />
          ) : (
            <>
              <MaterialIcons name="refresh" size={18} color="#525252" />
              <Text className="text-neutral-600 text-center font-medium ml-1">
                Refresh
              </Text>
            </>
          )}
        </Pressable>

        {/* Cancel Button - only show if active with remaining balance */}
        {isActive && remainingUsdc > 0 && (
          <Pressable
            onPress={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 border border-red-200 rounded-lg"
          >
            <Text className="text-red-600 text-center font-medium">
              Cancel Order
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

/** Status badge component */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'processing':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active' };
      case 'settled':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Settled' };
      case 'cancelled':
        return { bg: 'bg-neutral-100', text: 'text-neutral-600', label: 'Cancelled' };
      default:
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: status };
    }
  };

  const style = getStatusStyle();

  return (
    <View className={`px-2 py-1 rounded-full ${style.bg}`}>
      <Text className={`text-xs font-medium ${style.text}`}>{style.label}</Text>
    </View>
  );
};

/** Fill history list component */
const FillHistoryList: React.FC<{ fills: FillHistoryItem[] }> = ({ fills }) => (
  <View className="border-t border-neutral-100 pt-3">
    <Text className="text-sm font-medium text-neutral-700 mb-2">
      Fill History
    </Text>
    {fills.slice(0, 5).map((fill, index) => (
      <View key={index} className="flex-row justify-between py-2 border-b border-neutral-50">
        <View>
          <Text className="text-sm text-neutral-700">
            {fill.amountUsdc.toFixed(2)} USDC @ {fill.rate.toLocaleString('vi-VN')}
          </Text>
          <Text className="text-xs text-neutral-400">
            {new Date(fill.matchedAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <View className="flex-row items-center">
          {fill.vndSettled ? (
            <>
              <MaterialIcons name="check-circle" size={14} color="#22c55e" />
              <Text className="text-sm text-green-600 ml-1">Settled</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="schedule" size={14} color="#f59e0b" />
              <Text className="text-sm text-amber-600 ml-1">Pending</Text>
            </>
          )}
        </View>
      </View>
    ))}
    {fills.length > 5 && (
      <Text className="text-xs text-neutral-400 text-center mt-2">
        +{fills.length - 5} more fills
      </Text>
    )}
  </View>
);

export default SmartSellProgressCard;
