import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authentication-store';

export default function LoginScreen() {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleLogin = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter a Sui address');
      return;
    }

    // Basic validation for Sui address format (starts with 0x, 66 chars)
    if (!address.startsWith('0x') || address.length !== 66) {
      Alert.alert('Error', 'Invalid Sui address format');
      return;
    }

    try {
      setIsLoading(true);
      await login(address);
      router.replace('/(tabs)/wallet');
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to SuiGate</Text>
        <Text style={styles.subtitle}>
          Connect your Sui wallet to get started
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Sui Wallet Address</Text>
          <TextInput
            style={styles.input}
            placeholder="0x..."
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Note: This is a demo version. In production, we'll integrate with Sui wallet providers.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F2F2F7',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
