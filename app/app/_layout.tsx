import '../global.css';
import '../src/i18n'; // Initialize i18n
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/stores/authentication-store';
import { ErrorBoundary } from '../src/components/error/error-boundary';

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </ErrorBoundary>
  );
}
