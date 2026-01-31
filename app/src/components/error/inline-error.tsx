import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/hooks/use-translation';

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Inline error component for displaying validation or form errors.
 * Shows error icon with optional retry and dismiss actions.
 */
export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  onRetry,
  onDismiss,
}) => {
  const { t } = useTranslation();

  return (
    <View className="bg-red-50 rounded-xl p-4 flex-row items-start">
      <MaterialIcons name="error-outline" size={20} color="#ef4444" />

      <View className="flex-1 ml-3">
        <Text className="text-red-600 text-sm">{message}</Text>

        {onRetry && (
          <TouchableOpacity onPress={onRetry} className="mt-2">
            <Text className="text-red-600 font-medium text-sm underline">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} className="ml-2">
          <MaterialIcons name="close" size={18} color="#ef4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};
