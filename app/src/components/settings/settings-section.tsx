import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  danger = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center py-4 border-b border-neutral-100"
      activeOpacity={0.7}
    >
      <View
        className={`w-9 h-9 rounded-lg items-center justify-center mr-3 ${
          danger ? 'bg-error/10' : 'bg-neutral-100'
        }`}
      >
        <MaterialIcons
          name={icon as any}
          size={20}
          color={danger ? '#ef4444' : '#6b7280'}
        />
      </View>

      <Text
        className={`flex-1 text-base ${danger ? 'text-error' : 'text-neutral-900'}`}
      >
        {label}
      </Text>

      {value && <Text className="text-neutral-500 mr-2">{value}</Text>}

      {showArrow && onPress && (
        <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );
};

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  return (
    <View className="mb-6">
      {title && (
        <Text className="text-neutral-500 text-sm font-medium uppercase tracking-wide mb-2 px-1">
          {title}
        </Text>
      )}
      <View className="bg-white rounded-xl px-4">{children}</View>
    </View>
  );
};
