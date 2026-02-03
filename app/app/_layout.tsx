import '../global.css';
import '../src/i18n'; // Initialize i18n
import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../src/stores/authentication-store';
import { useGlobalUiStore } from '../src/stores/global-ui-state-store';
import { ErrorBoundary } from '../src/components/error/error-boundary';
import { ToastNotificationContainer } from '../src/components/ui/toast-notification-container';
import { GlobalLoadingOverlay } from '../src/components/ui/global-loading-overlay';
import { OfflineNetworkBanner } from '../src/components/ui/offline-network-banner';
import { setToastFunction } from '../src/api/axios-client-with-auth-interceptors';
import { extractIdTokenFromUrl } from '../src/utils/oauth-url-parser';


export default function RootLayout() {
  const router = useRouter();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const restoreZkLoginSession = useAuthStore((state) => state.restoreZkLoginSession);
  const completeOAuth = useAuthStore((state) => state.completeOAuthCallback);
  const showToast = useGlobalUiStore((state) => state.showToast);

  // Handle OAuth deep links at root level
  useEffect(() => {
    let oauthHandled = false;

    const handleOAuthUrl = async (url: string) => {
      if (oauthHandled) return;
      console.log('[RootLayout] Checking URL for OAuth:', url);

      const token = extractIdTokenFromUrl(url);
      if (token) {
        oauthHandled = true;
        console.log('[RootLayout] OAuth token found, completing auth...');
        await completeOAuth(token);
        router.replace('/');
      }
    };

    // Listen for URL events
    const subscription = Linking.addEventListener('url', (event) => {
      handleOAuthUrl(event.url);
    });

    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url) handleOAuthUrl(url);
    });

    return () => subscription.remove();
  }, [completeOAuth, router]);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      // Restore zkLogin session if authenticated
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        await restoreZkLoginSession();
      }
    };
    init();
    // Set toast function for API client
    setToastFunction(showToast);
  }, [checkAuth, restoreZkLoginSession, showToast]);

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
