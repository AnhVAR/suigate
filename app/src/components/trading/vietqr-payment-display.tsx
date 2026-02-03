/**
 * VietQR Payment Display Component
 * Shows QR code with countdown timer for buy USDC flow
 * Uses local QR generation (no external API dependency)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { ordersBuySellApiService } from '../../api/orders-buy-sell-api-service';

interface VietQRPaymentDisplayProps {
  qrData: string;
  reference: string;
  amountVnd: number;
  expiresAt: Date;
  onExpired?: () => void;
  onCancel?: () => void;
  onPaymentSuccess?: () => void;
}

export const VietQRPaymentDisplay: React.FC<VietQRPaymentDisplayProps> = ({
  qrData,
  reference,
  amountVnd,
  expiresAt,
  onExpired,
  onCancel,
  onPaymentSuccess,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Check if running in development mode
  const isDev = __DEV__;

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const result = await ordersBuySellApiService.simulatePayment(reference);
      if (result.success) {
        Alert.alert('Success', 'Payment simulated successfully!', [
          { text: 'OK', onPress: onPaymentSuccess },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to simulate payment');
      }
    } catch {
      Alert.alert('Error', 'Failed to simulate payment');
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft(0);
        onExpired?.();
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatVnd = (amount: number): string => {
    return amount.toLocaleString('vi-VN');
  };

  const isExpired = timeLeft === 0;

  return (
    <View className="items-center">
      {/* Timer */}
      <View
        className={`flex-row items-center px-4 py-2 rounded-full mb-6 ${
          isExpired ? 'bg-red-100' : 'bg-amber-100'
        }`}
      >
        <MaterialIcons
          name={isExpired ? 'error' : 'timer'}
          size={18}
          color={isExpired ? '#ef4444' : '#f59e0b'}
        />
        <Text
          className={`ml-2 font-semibold ${
            isExpired ? 'text-red-600' : 'text-amber-600'
          }`}
        >
          {isExpired ? 'Expired' : `Expires in ${formatTime(timeLeft)}`}
        </Text>
      </View>

      {/* QR Code */}
      <View className="bg-white p-4 rounded-2xl shadow-lg mb-6">
        {isExpired ? (
          <View className="w-64 h-64 bg-neutral-100 items-center justify-center rounded-xl">
            <MaterialIcons name="qr-code-2" size={64} color="#d1d5db" />
            <Text className="text-neutral-500 mt-2">QR Code Expired</Text>
          </View>
        ) : (
          <QRCode value={qrData} size={256} backgroundColor="white" />
        )}
      </View>

      {/* Details */}
      <View className="w-full bg-neutral-50 rounded-xl p-4 mb-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-neutral-500">Amount</Text>
          <Text className="text-neutral-900 font-semibold">
            {formatVnd(amountVnd)} VND
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-neutral-500">Reference</Text>
          <Text className="text-neutral-900 font-mono">{reference}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View className="w-full bg-blue-50 rounded-xl p-4 mb-6">
        <Text className="text-neutral-700 text-sm leading-relaxed">
          <Text className="font-semibold">Instructions: </Text>
          Open your banking app, scan this QR code, and complete the transfer.
          Your USDC will be credited automatically.
        </Text>
      </View>

      {/* Simulate Payment Button (Dev only) */}
      {isDev && !isExpired && (
        <TouchableOpacity
          onPress={handleSimulatePayment}
          disabled={isSimulating}
          className="w-full bg-green-500 rounded-xl py-4 mb-4"
          style={{ opacity: isSimulating ? 0.7 : 1 }}
        >
          <View className="flex-row items-center justify-center">
            <MaterialIcons
              name={isSimulating ? 'hourglass-empty' : 'play-circle-filled'}
              size={20}
              color="white"
            />
            <Text className="text-white font-semibold ml-2">
              {isSimulating ? 'Processing...' : '🧪 Simulate Payment (Dev)'}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Cancel Button */}
      {onCancel && !isExpired && (
        <TouchableOpacity onPress={onCancel} className="py-3">
          <Text className="text-neutral-500">Cancel Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
