import '../global.css';
import '../src/i18n'; // Initialize i18n
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/stores/authentication-store';
import { useGlobalUiStore } from '../src/stores/global-ui-state-store';
import { ErrorBoundary } from '../src/components/error/error-boundary';
import { ToastNotificationContainer } from '../src/components/ui/toast-notification-container';
import { GlobalLoadingOverlay } from '../src/components/ui/global-loading-overlay';
import { OfflineNetworkBanner } from '../src/components/ui/offline-network-banner';
import { setToastFunction } from '../src/api/axios-client-with-auth-interceptors';

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const showToast = useGlobalUiStore((state) => state.showToast);

  useEffect(() => {
    checkAuth();
    // Set toast function for API client
    setToastFunction(showToast);
  }, [checkAuth, showToast]);

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      {/* Global UI Components */}
      <OfflineNetworkBanner />
      <ToastNotificationContainer />
      <GlobalLoadingOverlay />
    </ErrorBoundary>
  );
}
