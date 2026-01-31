import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryButton } from '../buttons/primary-button';
import { useTranslation } from '../../i18n/hooks/use-translation';

interface NetworkErrorProps {
  onRetry: () => void;
  message?: string;
}

/**
 * Full-screen network error component with retry button.
 * Shows wifi-off icon and user-friendly error message.
 */
export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  message,
}) => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
        <MaterialIcons name="wifi-off" size={40} color="#ef4444" />
      </View>

      <Text className="text-xl font-bold text-neutral-900 mb-2">
        {t('errors.networkError')}
      </Text>

      <Text className="text-neutral-500 text-center mb-6">
        {message || t('errors.networkMessage')}
      </Text>

      <PrimaryButton
        title={t('common.retry')}
        onPress={onRetry}
        variant="primary"
        fullWidth={false}
      />
    </View>
  );
};
