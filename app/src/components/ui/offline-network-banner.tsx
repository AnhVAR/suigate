/**
 * Offline Network Banner
 * Shows banner when device is offline
 * Uses standard React Native components (no reanimated)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkConnectivityStatus } from '../../hooks/use-network-connectivity-status';

export const OfflineNetworkBanner: React.FC = () => {
  const { isOnline } = useNetworkConnectivityStatus();

  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        You are offline. Some features may be limited.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#eab308',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    textAlign: 'center',
    color: '#000',
    fontWeight: '500',
  },
});
