import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authentication-store';
import { loginWithGoogle, loginWithApple } from '../../src/services/zklogin-oauth-service';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState<'google' | 'apple' | null>(null);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading('google');
    try {
      const result = await loginWithGoogle();
      if (result.success && result.suiAddress) {
        await login(result.suiAddress, result.email);
        router.replace('/(auth)/kyc-verification');
      } else {
        Alert.alert('Error', result.error || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login with Google');
    } finally {
      setIsLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading('apple');
    try {
      const result = await loginWithApple();
      if (result.success && result.suiAddress) {
        await login(result.suiAddress, result.email);
        router.replace('/(auth)/kyc-verification');
      } else {
        Alert.alert('Error', result.error || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login with Apple');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo & Title */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <MaterialIcons name="account-balance-wallet" size={40} color="white" />
          </View>
          <Text style={styles.title}>Welcome to SuiGate</Text>
          <Text style={styles.subtitle}>
            VND to USDC conversion wallet{'\n'}for Vietnam
          </Text>
        </View>

        {/* OAuth Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={isLoading !== null}
            style={[styles.googleButton, isLoading === 'google' && styles.buttonDisabled]}
          >
            {isLoading === 'google' ? (
              <Text style={styles.googleText}>Connecting...</Text>
            ) : (
              <>
                <Image
                  source={{ uri: 'https://www.google.com/favicon.ico' }}
                  style={styles.icon}
                />
                <Text style={styles.googleText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAppleLogin}
            disabled={isLoading !== null}
            style={[styles.appleButton, isLoading === 'apple' && styles.buttonDisabled]}
          >
            {isLoading === 'apple' ? (
              <Text style={styles.appleText}>Connecting...</Text>
            ) : (
              <>
                <MaterialIcons name="apple" size={22} color="white" />
                <Text style={styles.appleText}>Continue with Apple</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service{'\n'}and Privacy Policy
          </Text>
        </View>

        {/* Demo Note */}
        <View style={styles.demoNote}>
          <Text style={styles.demoText}>
            Demo: zkLogin generates seedless wallet from your OAuth account
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#171717',
    marginBottom: 8,
  },
  subtitle: {
    color: '#737373',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  buttons: {
    gap: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    backgroundColor: '#000000',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleText: {
    color: '#262626',
    fontWeight: '600',
    fontSize: 16,
  },
  appleText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    marginTop: 32,
  },
  terms: {
    color: '#a3a3a3',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
  demoNote: {
    marginTop: 24,
    backgroundColor: '#f3e8ff',
    padding: 16,
    borderRadius: 12,
  },
  demoText: {
    color: '#7c3aed',
    fontSize: 14,
    textAlign: 'center',
  },
});
