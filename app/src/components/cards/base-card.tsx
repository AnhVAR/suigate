import React from 'react';
import { View, ViewProps } from 'react-native';

interface BaseCardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const variantStyles = {
  elevated: 'bg-white shadow-md',
  outlined: 'bg-white border border-neutral-200',
  filled: 'bg-neutral-50',
};

export const BaseCard: React.FC<BaseCardProps> = ({
  variant = 'elevated',
  padding = 'md',
  children,
  className,
  ...props
}) => {
  return (
    <View
      className={`
        rounded-card
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </View>
  );
};
