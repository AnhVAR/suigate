/**
 * VietQR Payment Display Component
 * Shows QR code with countdown timer for buy USDC flow
 * Polls backend to detect payment confirmation
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { ordersBuySellApiService } from '../../api/orders-buy-sell-api-service';

const POLL_INTERVAL_MS = 3000; // Poll every 3 seconds

interface VietQRPaymentDisplayProps {
  orderId: string;
  qrData: string;
  reference: string;
  amountVnd: number;
  expiresAt: Date;
  onExpired?: () => void;
  onCancel?: () => void;
  onPaymentConfirmed?: () => void;
}

export const VietQRPaymentDisplay: React.FC<VietQRPaymentDisplayProps> = ({
  orderId,
  qrData,
  reference,
  amountVnd,
  expiresAt,
  onExpired,
  onCancel,
  onPaymentConfirmed,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for order status changes
  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        const order = await ordersBuySellApiService.getOrder(orderId);
        // Payment confirmed when status is paid or settled
        if (order.status === 'paid' || order.status === 'settled') {
          onPaymentConfirmed?.();
        }
      } catch (error) {
        console.error('Failed to check order status:', error);
      }
    };

    // Start polling
    pollIntervalRef.current = setInterval(checkOrderStatus, POLL_INTERVAL_MS);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [orderId, onPaymentConfirmed]);

  // Countdown timer
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

      {/* Cancel Button */}
      {onCancel && !isExpired && (
        <TouchableOpacity onPress={onCancel} className="py-3">
          <Text className="text-neutral-500">Cancel Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
