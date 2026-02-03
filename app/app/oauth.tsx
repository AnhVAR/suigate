/**
 * OAuth callback route - Loading screen while _layout.tsx handles deep link
 * Note: Main OAuth handling is in _layout.tsx to avoid race conditions
 */

import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const OAUTH_TIMEOUT_MS = 30_000;

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Timeout fallback - _layout.tsx should handle OAuth before this
    const timeout = setTimeout(() => {
      console.log('[OAuth Route] Timeout, redirecting home');
      router.replace('/');
    }, OAUTH_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4f46e5" />
      <Text style={styles.text}>Completing authentication...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  text: { marginTop: 16, color: '#fff', fontSize: 16 },
});
