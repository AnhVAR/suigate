/**
 * Smart Sell Cancel Confirmation Modal
 * Shows refund/pending VND breakdown and handles cancel transaction
 */
import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { CancelPayloadDto } from '@suigate/shared-types';

interface SmartSellCancelModalProps {
  visible: boolean;
  payload: CancelPayloadDto | null;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export const SmartSellCancelModal: React.FC<SmartSellCancelModalProps> = ({
  visible,
  payload,
  onConfirm,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!payload) return null;

  const hasRemaining = payload.remainingUsdc > 0;
  const hasFilled = payload.filledUsdc > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white rounded-2xl w-full max-w-sm p-6">
          {/* Header */}
          <View className="items-center mb-4">
            <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-3">
              <MaterialIcons name="cancel" size={28} color="#dc2626" />
            </View>
            <Text className="text-lg font-bold text-neutral-900">
              Cancel Smart Sell?
            </Text>
          </View>

          {/* Summary */}
          <View className="bg-neutral-50 rounded-xl p-4 mb-4">
            {/* Refund Amount */}
            {hasRemaining && (
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-neutral-600">USDC Refund</Text>
                <Text className="font-semibold text-green-600">
                  +{payload.remainingUsdc.toFixed(2)} USDC
                </Text>
              </View>
            )}

            {/* Filled Amount */}
            {hasFilled && (
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-neutral-600">Already Filled</Text>
                <Text className="font-semibold text-neutral-700">
                  {payload.filledUsdc.toFixed(2)} USDC
                </Text>
              </View>
            )}

            {/* Pending VND */}
            {payload.pendingVnd > 0 && (
              <View className="flex-row justify-between items-center pt-2 border-t border-neutral-200">
                <Text className="text-neutral-600">Pending VND</Text>
                <Text className="font-semibold text-amber-600">
                  {payload.pendingVnd.toLocaleString('vi-VN')} VND
                </Text>
              </View>
            )}
          </View>

          {/* Info message */}
          {hasFilled && (
            <View className="flex-row bg-blue-50 rounded-lg p-3 mb-4">
              <MaterialIcons name="info" size={18} color="#3b82f6" />
              <Text className="text-sm text-blue-700 ml-2 flex-1">
                Filled portions will still be settled. You'll receive VND for matched amounts.
              </Text>
            </View>
          )}

          {/* On-chain notice */}
          {hasRemaining && payload.escrowObjectId && (
            <View className="flex-row bg-amber-50 rounded-lg p-3 mb-4">
              <MaterialIcons name="account-balance-wallet" size={18} color="#d97706" />
              <Text className="text-sm text-amber-700 ml-2 flex-1">
                This will require signing a transaction to refund your USDC from escrow.
              </Text>
            </View>
          )}

          {/* Error */}
          {error && (
            <View className="bg-red-50 rounded-lg p-3 mb-4">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          )}

          {/* Actions */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              disabled={isLoading}
              className="flex-1 py-3 border border-neutral-200 rounded-xl"
            >
              <Text className="text-neutral-600 text-center font-medium">
                Keep Order
              </Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              disabled={isLoading}
              className="flex-1 py-3 bg-red-500 rounded-xl flex-row justify-center items-center"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-center font-medium">
                  Cancel Order
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SmartSellCancelModal;
