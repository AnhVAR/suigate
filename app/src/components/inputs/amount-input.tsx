import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface AmountInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  currency: 'VND' | 'USDC';
  label?: string;
  error?: string;
  maxAmount?: number;
  showMaxButton?: boolean;
  equivalentValue?: string;
  equivalentCurrency?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChangeValue,
  currency,
  label,
  error,
  maxAmount,
  showMaxButton = false,
  equivalentValue,
  equivalentCurrency,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleMaxPress = () => {
    if (maxAmount !== undefined) {
      onChangeValue(maxAmount.toString());
    }
  };

  const formatDisplay = (val: string): string => {
    // Remove non-numeric except decimal
    const clean = val.replace(/[^0-9.]/g, '');
    return clean;
  };

  const borderColor = error
    ? 'border-error'
    : isFocused
    ? 'border-primary-500'
    : 'border-neutral-200';

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-neutral-700 mb-2">
          {label}
        </Text>
      )}

      <View
        className={`
          bg-neutral-50 rounded-card p-4
          border ${borderColor}
        `}
      >
        <View className="flex-row items-center justify-between">
          <TextInput
            className="flex-1 text-3xl font-bold text-neutral-900"
            value={value}
            onChangeText={(text) => onChangeValue(formatDisplay(text))}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="#9ca3af"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <View className="flex-row items-center">
            {showMaxButton && maxAmount !== undefined && (
              <TouchableOpacity
                onPress={handleMaxPress}
                className="bg-primary-100 px-3 py-1 rounded-full mr-2"
              >
                <Text className="text-primary-600 text-sm font-medium">MAX</Text>
              </TouchableOpacity>
            )}

            <View className="bg-neutral-200 px-3 py-2 rounded-lg">
              <Text className="text-neutral-700 font-semibold">{currency}</Text>
            </View>
          </View>
        </View>

        {equivalentValue && equivalentCurrency && (
          <Text className="text-neutral-500 text-sm mt-2">
            {'\u2248'} {equivalentValue} {equivalentCurrency}
          </Text>
        )}
      </View>

      {error && (
        <Text className="text-sm text-error mt-1">{error}</Text>
      )}
    </View>
  );
};
