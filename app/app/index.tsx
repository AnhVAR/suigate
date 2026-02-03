import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/authentication-store';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading, kycStatus, locationStatus } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Check KYC status - if not verified, go to KYC flow
  if (kycStatus !== 'verified') {
    return <Redirect href="/(auth)/kyc-verification" />;
  }

  // Check location status - if not verified, go to location verification
  if (locationStatus !== 'within_sandbox') {
    return <Redirect href="/(auth)/location-verification" />;
  }

  // All verified - go to wallet
  return <Redirect href="/(tabs)/wallet" />;
}
