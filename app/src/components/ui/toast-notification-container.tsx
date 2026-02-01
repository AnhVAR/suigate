/**
 * Toast Notification Container
 * Displays toast messages at the top of the screen
 * Uses standard React Native Animated (no reanimated/Worklets)
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { useGlobalUiStore } from '../../stores/global-ui-state-store';

const ToastItem: React.FC<{
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onDismiss: (id: string) => void;
}> = ({ id, message, type, onDismiss }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const bgColor =
    type === 'error'
      ? '#ef4444'
      : type === 'success'
      ? '#22c55e'
      : type === 'warning'
      ? '#eab308'
      : '#3b82f6';

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bgColor, opacity, transform: [{ translateY }] },
      ]}
    >
      <Pressable onPress={() => onDismiss(id)}>
        <Text style={styles.text}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
};

export const ToastNotificationContainer: React.FC = () => {
  const { toasts, dismissToast } = useGlobalUiStore();

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={dismissToast}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    zIndex: 50,
  },
  toast: {
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontWeight: '500',
  },
});
