import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type StatusType = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const statusConfig: Record<StatusType, { bg: string; text: string; icon: string; label: string }> = {
  pending: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    icon: 'schedule',
    label: 'Pending',
  },
  processing: {
    bg: 'bg-info/10',
    text: 'text-info',
    icon: 'sync',
    label: 'Processing',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    icon: 'check-circle',
    label: 'Success',
  },
  failed: {
    bg: 'bg-error/10',
    text: 'text-error',
    icon: 'error',
    label: 'Failed',
  },
  cancelled: {
    bg: 'bg-neutral-100',
    text: 'text-neutral-500',
    icon: 'cancel',
    label: 'Cancelled',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const config = statusConfig[status];
  const iconSize = size === 'sm' ? 14 : 16;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';

  return (
    <View className={`flex-row items-center ${config.bg} ${padding} rounded-full`}>
      <MaterialIcons
        name={config.icon as any}
        size={iconSize}
        className={config.text}
      />
      <Text className={`${config.text} ${textSize} font-medium ml-1`}>
        {config.label}
      </Text>
    </View>
  );
};
