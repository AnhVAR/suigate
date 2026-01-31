import React, { useState } from 'react';
import { View, Text, TextInput as RNTextInput, TextInputProps } from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? 'border-error'
    : isFocused
    ? 'border-primary-500'
    : 'border-neutral-200';

  return (
    <View className={`w-full ${className || ''}`}>
      {label && (
        <Text className="text-sm font-medium text-neutral-700 mb-2">
          {label}
        </Text>
      )}

      <View
        className={`
          flex-row items-center
          h-13 px-4
          bg-neutral-50 rounded-input
          border ${borderColor}
        `}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <RNTextInput
          className="flex-1 text-base text-neutral-900"
          placeholderTextColor="#9ca3af"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>

      {error && (
        <Text className="text-sm text-error mt-1">{error}</Text>
      )}

      {hint && !error && (
        <Text className="text-sm text-neutral-500 mt-1">{hint}</Text>
      )}
    </View>
  );
};
