/**
 * OAuth callback handler route
 * Receives id_token from proxy redirect and completes auth flow
 */

import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../src/stores/authentication-store';

// Extract token from URL (handles both query params and fragment)
const extractToken = (url: string): string | null => {
  console.log('[OAuth] Extracting token from:', url);

  // Try fragment first (#id_token=xxx)
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    const fragment = url.substring(hashIndex + 1);
    const params = new URLSearchParams(fragment);
    const token = params.get('id_token');
    if (token) return token;
  }

  // Try query params (?id_token=xxx)
  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    const query = url.substring(queryIndex + 1);
    const params = new URLSearchParams(query);
    const token = params.get('id_token');
    if (token) return token;
  }

  return null;
};

export default function OAuthCallback() {
  const router = useRouter();
  const completeOAuth = useAuthStore((s) => s.completeOAuthCallback);
  const [status, setStatus] = useState('Completing authentication...');

  useEffect(() => {
    let handled = false;

    const processToken = async (idToken: string) => {
      if (handled) return;
      handled = true;
      console.log('[OAuth Callback] Token found, completing auth...');
      setStatus('Authenticating...');
      await completeOAuth(idToken);
      router.replace('/');
    };

    const handleUrl = async (event: { url: string }) => {
      console.log('[OAuth Callback] URL event:', event.url);
      const token = extractToken(event.url);
      if (token) {
        await processToken(token);
      }
    };

    // Listen for URL events (handles deep links when app is already open)
    const subscription = Linking.addEventListener('url', handleUrl);

    // Check initial URL (handles deep links that launched the app)
    const checkInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      console.log('[OAuth Callback] Initial URL:', url);

      if (url) {
        const token = extractToken(url);
        if (token) {
          await processToken(token);
          return;
        }
      }

      // No token in initial URL, wait for URL event
      console.log('[OAuth Callback] Waiting for OAuth redirect...');
      setStatus('Waiting for Google...');
    };

    checkInitialUrl();

    // Timeout fallback - redirect home after 30s
    const timeout = setTimeout(() => {
      if (!handled) {
        console.log('[OAuth Callback] Timeout, redirecting home');
        router.replace('/');
      }
    }, 30000);

    return () => {
      subscription.remove();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4f46e5" />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  text: { marginTop: 16, color: '#fff', fontSize: 16 },
});
