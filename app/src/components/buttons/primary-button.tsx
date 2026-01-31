import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: 'bg-primary-500', text: 'text-white' },
  secondary: { bg: 'bg-neutral-100', text: 'text-neutral-800' },
  outline: { bg: 'bg-transparent', text: 'text-primary-500', border: 'border border-primary-500' },
  danger: { bg: 'bg-error', text: 'text-white' },
  success: { bg: 'bg-success', text: 'text-white' },
};

const sizeStyles: Record<ButtonSize, { height: string; text: string; px: string }> = {
  sm: { height: 'h-10', text: 'text-sm', px: 'px-4' },
  md: { height: 'h-13', text: 'text-base', px: 'px-6' },
  lg: { height: 'h-14', text: 'text-lg', px: 'px-8' },
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  disabled,
  className,
  ...props
}) => {
  const { bg, text, border } = variantStyles[variant];
  const { height, text: textSize, px } = sizeStyles[size];

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={`
        ${bg} ${height} ${px} ${border || ''}
        rounded-button items-center justify-center flex-row
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : 'active:opacity-80'}
        ${className || ''}
      `}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'secondary' ? '#8b5cf6' : '#fff'}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            className={`
              ${text} ${textSize} font-semibold
              ${leftIcon ? 'ml-2' : ''} ${rightIcon ? 'mr-2' : ''}
            `}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};
