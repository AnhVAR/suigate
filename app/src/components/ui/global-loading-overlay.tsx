/**
 * Global Loading Overlay
 * Full-screen loading indicator for blocking operations
 */

import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useGlobalUiStore } from '../../stores/global-ui-state-store';

export const GlobalLoadingOverlay: React.FC = () => {
  const { isGlobalLoading } = useGlobalUiStore();

  if (!isGlobalLoading) return null;

  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-40">
      <View className="bg-white rounded-lg p-6 items-center">
        <ActivityIndicator size="large" color="#0066FF" />
        <Text className="mt-4 text-gray-700 font-medium">Loading...</Text>
      </View>
    </View>
  );
};
