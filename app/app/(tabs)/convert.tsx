/**
 * Convert Screen
 * Unified trading interface for Buy USDC, Quick Sell, and Smart Sell
 */

import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authentication-store';
import { useWalletStore } from '../../src/stores/wallet-balance-store';
import { useBankAccountStore } from '../../src/stores/bank-account-store';
import {
  getCurrentRate,
  createBuyOrder,
  createQuickSellOrder,
  createSmartSellOrder,
  validateTargetRate,
  type DepositPayload,
} from '../../src/services/trading-service';
import { executeQuickSellDeposit } from '../../src/services/sui-wallet-service';
import { ordersBuySellApiService } from '../../src/api/orders-buy-sell-api-service';
import {
  PrimaryButton,
  AmountInput,
  RateDisplay,
  BankAccountPicker,
  VietQRPaymentDisplay,
  FeeComparisonCard,
} from '../../src/components';

type TradeMode = 'buy' | 'quick-sell' | 'smart-sell';
type Step = 'input' | 'qr' | 'deposit' | 'success';

export default function ConvertScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<TradeMode>('buy');
  const [step, setStep] = useState<Step>('input');

  // Input state
  const [amount, setAmount] = useState('');
  const [targetRate, setTargetRate] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);

  // Rate state
  const [currentRate, setCurrentRate] = useState(25000);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  // Order state
  const [orderData, setOrderData] = useState<{
    orderId?: string;
    qrData?: string;
    reference?: string;
    amountVnd?: number;
    amountUsdc?: number;
    expiresAt?: Date;
    depositPayload?: DepositPayload;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);

  const { canAccessVndFeatures } = useAuthStore();
  const { usdcBalance } = useWalletStore();
  const { accounts: bankAccounts, isLoading: isBankAccountsLoading, loadAccounts } = useBankAccountStore();

  const fetchRate = useCallback(async () => {
    setIsLoadingRate(true);
    try {
      const rate = await getCurrentRate();
      setCurrentRate(rate);
    } finally {
      setIsLoadingRate(false);
    }
  }, []);

  useEffect(() => {
    if (params.mode) {
      setMode(params.mode as TradeMode);
    }
    fetchRate();
    loadAccounts();
  }, [params.mode, fetchRate, loadAccounts]);

  // Auto-select primary bank account when accounts are loaded
  useEffect(() => {
    if (bankAccounts.length > 0 && selectedBankId === null) {
      const primary = bankAccounts.find((a) => a.isPrimary);
      setSelectedBankId(primary?.id || bankAccounts[0].id);
    }
  }, [bankAccounts, selectedBankId]);

  const canAccess = canAccessVndFeatures();
  const amountNum = parseFloat(amount) || 0;
  const targetRateNum = parseFloat(targetRate) || currentRate;

  // Calculate output based on mode
  const getCalculation = () => {
    if (mode === 'buy') {
      const fee = amountNum * 0.005;
      const usdc = (amountNum - fee) / currentRate;
      return { output: usdc, fee };
    } else {
      const feeRate = mode === 'quick-sell' ? 0.005 : 0.002;
      const rate = mode === 'smart-sell' ? targetRateNum : currentRate;
      const gross = amountNum * rate;
      const feeAmount = gross * feeRate;
      return { output: gross - feeAmount, fee: feeAmount };
    }
  };

  const calc = getCalculation();

  /**
   * Extract user-friendly error message from API error response
   */
  const extractErrorMessage = (error: unknown): string => {
    // Check if it's an axios error with response
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          data?: {
            message?: string | string[];
            error?: string;
          };
        };
      };

      const message = axiosError.response?.data?.message;

      // Handle array of error messages
      if (Array.isArray(message)) {
        return message.join(', ');
      }

      // Handle single error message
      if (typeof message === 'string') {
        return message;
      }

      // Fallback to error field
      if (axiosError.response?.data?.error) {
        return axiosError.response.data.error;
      }
    }

    // Generic fallback
    return 'Failed to create order. Please try again.';
  };

  const handleSubmit = async () => {
    if (!canAccess) {
      Alert.alert('Access Denied', 'Please complete KYC and location verification');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'buy') {
        if (amountNum < 50000) {
          Alert.alert('Error', 'Minimum amount is 50,000 VND');
          return;
        }
        const result = await createBuyOrder(amountNum);
        setOrderData({
          orderId: result.orderId,
          qrData: result.qrData,
          reference: result.reference,
          amountVnd: result.amountVnd,
          amountUsdc: result.amountUsdc,
          expiresAt: result.expiresAt,
        });
        setStep('qr');
      } else if (mode === 'quick-sell') {
        if (amountNum > usdcBalance) {
          Alert.alert('Error', 'Insufficient balance');
          return;
        }
        if (!selectedBankId) {
          Alert.alert('Error', 'Please select a bank account');
          return;
        }
        const result = await createQuickSellOrder(amountNum, selectedBankId);
        setOrderData({
          orderId: result.orderId,
          amountUsdc: result.amountUsdc,
          amountVnd: result.amountVnd,
          depositPayload: result.depositPayload,
        });
        setStep('deposit');
      } else {
        // Smart Sell
        const validation = validateTargetRate(targetRateNum, currentRate);
        if (!validation.valid) {
          Alert.alert('Error', validation.error);
          return;
        }
        if (!selectedBankId) {
          Alert.alert('Error', 'Please select a bank account');
          return;
        }
        await createSmartSellOrder(amountNum, targetRateNum, selectedBankId);
        setStep('success');
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      Alert.alert('Error', errorMessage);
      console.error('Order creation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAmount('');
    setTargetRate('');
    setOrderData(null);
    setStep('input');
  };

  const { zkLoginData } = useAuthStore();

  const handleDeposit = async () => {
    if (!orderData?.depositPayload || !zkLoginData) {
      Alert.alert('Error', 'Missing deposit data or wallet not connected');
      return;
    }

    setIsDepositing(true);
    try {
      // Execute deposit transaction with zkLogin
      const result = await executeQuickSellDeposit(orderData.depositPayload, zkLoginData);

      if (!result.success) {
        throw new Error('Deposit transaction failed');
      }

      // Confirm order with tx hash
      await ordersBuySellApiService.confirmOrder(orderData.orderId!, { txHash: result.digest });

      setStep('success');
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      Alert.alert('Deposit Failed', errorMessage);
      console.error('Deposit failed:', error);
    } finally {
      setIsDepositing(false);
    }
  };

  // Deposit Step (Quick Sell)
  if (step === 'deposit' && orderData) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 px-6 py-8">
          <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
            Deposit USDC
          </Text>
          <Text className="text-neutral-500 text-center mb-8">
            Confirm the transaction to deposit USDC to the liquidity pool
          </Text>

          {/* Order Summary */}
          <View className="bg-neutral-50 rounded-xl p-4 mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-500">Amount</Text>
              <Text className="text-neutral-900 font-medium">
                {orderData.amountUsdc?.toFixed(2)} USDC
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-500">You will receive</Text>
              <Text className="text-neutral-900 font-medium">
                {orderData.amountVnd?.toLocaleString('vi-VN')} VND
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-neutral-500">Order ID</Text>
              <Text className="text-neutral-500 text-xs">
                {orderData.orderId?.slice(0, 8)}...
              </Text>
            </View>
          </View>

          <View className="flex-1" />

          <PrimaryButton
            title={isDepositing ? 'Signing Transaction...' : 'Confirm Deposit'}
            onPress={handleDeposit}
            isLoading={isDepositing}
          />

          <Pressable onPress={handleReset} className="mt-4 py-3">
            <Text className="text-neutral-500 text-center">Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // QR Display Step (Buy only)
  if (step === 'qr' && orderData) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <ScrollView className="flex-1" contentContainerClassName="p-5">
          <Text className="text-2xl font-bold text-neutral-900 text-center mb-6">
            Scan to Pay
          </Text>
          <VietQRPaymentDisplay
            orderId={orderData.orderId || ''}
            qrData={orderData.qrData || ''}
            reference={orderData.reference || ''}
            amountVnd={orderData.amountVnd || 0}
            expiresAt={orderData.expiresAt || new Date()}
            onExpired={handleReset}
            onCancel={handleReset}
            onPaymentConfirmed={() => setStep('success')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Success Step
  if (step === 'success') {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="check-circle" size={56} color="#22c55e" />
          </View>
          <Text className="text-2xl font-bold text-neutral-900 mb-2">
            {mode === 'buy' ? 'Payment Confirmed!' : 'Order Created!'}
          </Text>
          <Text className="text-neutral-500 text-center mb-8">
            {mode === 'buy'
              ? 'USDC has been credited to your wallet'
              : mode === 'quick-sell'
              ? 'USDC deposited. VND will be transferred to your bank soon.'
              : 'Your Smart Sell order is active'}
          </Text>
          <PrimaryButton title="Done" onPress={handleReset} />
        </View>
      </SafeAreaView>
    );
  }

  // Input Step
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="p-5">
        {/* Header */}
        <Text className="text-2xl font-bold text-neutral-900 mb-6">Convert</Text>

        {/* Mode Tabs */}
        <View className="flex-row bg-neutral-100 rounded-xl p-1 mb-6">
          {(['buy', 'quick-sell', 'smart-sell'] as TradeMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => {
                setMode(m);
                handleReset();
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: mode === m ? '#ffffff' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontWeight: '500',
                  color: mode === m ? '#7c3aed' : '#6b7280',
                }}
              >
                {m === 'buy' ? 'Buy' : m === 'quick-sell' ? 'Quick Sell' : 'Smart Sell'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Access Warning */}
        {!canAccess && (
          <View className="bg-amber-100 rounded-xl p-4 mb-6 flex-row items-center">
            <MaterialIcons name="warning" size={20} color="#f59e0b" />
            <Text className="text-neutral-700 ml-2 flex-1 text-sm">
              Complete KYC and location verification to trade
            </Text>
          </View>
        )}

        {/* Rate Display */}
        <View className="mb-6">
          <RateDisplay
            rate={currentRate}
            isLoading={isLoadingRate}
            onRefresh={fetchRate}
          />
        </View>

        {/* Amount Input */}
        <View className="mb-6">
          <AmountInput
            value={amount}
            onChangeValue={setAmount}
            currency={mode === 'buy' ? 'VND' : 'USDC'}
            label={mode === 'buy' ? 'You pay' : 'You sell'}
            maxAmount={mode !== 'buy' ? usdcBalance : undefined}
            showMaxButton={mode !== 'buy'}
            equivalentValue={
              mode === 'buy'
                ? calc.output.toFixed(2)
                : calc.output.toLocaleString('vi-VN')
            }
            equivalentCurrency={mode === 'buy' ? 'USDC' : 'VND'}
          />
        </View>

        {/* Target Rate (Smart Sell only) */}
        {mode === 'smart-sell' && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-neutral-700 mb-2">
              Target Rate (VND/USDC)
            </Text>
            <View className="bg-neutral-50 rounded-xl border border-neutral-200 p-4">
              <AmountInput
                value={targetRate}
                onChangeValue={setTargetRate}
                currency="VND"
                equivalentValue={`Current: ${currentRate.toLocaleString('vi-VN')}`}
                equivalentCurrency=""
              />
            </View>
          </View>
        )}

        {/* Bank Account (Sell modes) */}
        {mode !== 'buy' && (
          <View className="mb-6">
            <BankAccountPicker
              accounts={bankAccounts}
              selectedId={selectedBankId}
              onSelect={setSelectedBankId}
              isLoading={isBankAccountsLoading}
              onAddNew={() => router.push('/settings')}
            />
          </View>
        )}

        {/* Fee Comparison (Smart Sell) */}
        {mode === 'smart-sell' && amountNum > 0 && (
          <View className="mb-6">
            <FeeComparisonCard
              quickSellVnd={amountNum * currentRate * 0.995}
              smartSellVnd={amountNum * targetRateNum * 0.998}
              savings={amountNum * targetRateNum * 0.998 - amountNum * currentRate * 0.995}
            />
          </View>
        )}

        {/* Fee Summary */}
        <View className="bg-neutral-50 rounded-xl p-4 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-neutral-500">Fee</Text>
            <Text className="text-neutral-700">
              {mode === 'smart-sell' ? '0.2%' : '0.5%'}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-neutral-700 font-medium">You receive</Text>
            <Text className="text-neutral-900 font-bold">
              {mode === 'buy'
                ? `${calc.output.toFixed(2)} USDC`
                : `${Math.round(calc.output).toLocaleString('vi-VN')} VND`}
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <PrimaryButton
          title={
            mode === 'buy'
              ? 'Generate QR Code'
              : mode === 'quick-sell'
              ? 'Sell Now'
              : 'Create Smart Sell Order'
          }
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={!canAccess || amountNum <= 0}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
