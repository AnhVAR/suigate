import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authentication-store';
import {
  requestLocationPermission,
  checkLocationStatus,
} from '../../src/services/location-permission-service';
import { PrimaryButton } from '../../src/components';

type CheckState = 'intro' | 'checking' | 'success' | 'outside' | 'denied';

export default function LocationCheckScreen() {
  const [state, setState] = useState<CheckState>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const setLocationStatus = useAuthStore((state) => state.setLocationStatus);
  const router = useRouter();

  const handleCheckLocation = async () => {
    setIsLoading(true);
    setState('checking');

    try {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        await setLocationStatus('denied');
        setState('denied');
        setIsLoading(false);
        return;
      }

      const result = await checkLocationStatus();

      if (result.withinSandbox) {
        await setLocationStatus('within_sandbox');
        setState('success');
      } else {
        await setLocationStatus('outside_sandbox');
        setState('outside');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check location');
      setState('intro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.replace('/(tabs)/wallet');
  };

  const handleSkip = () => {
    router.replace('/(tabs)/wallet');
  };

  // Success State
  if (state === 'success') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-success/10 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="location-on" size={56} color="#22c55e" />
          </View>
          <Text className="text-2xl font-bold text-neutral-900 mb-2">
            Location Verified
          </Text>
          <Text className="text-neutral-500 text-center mb-8">
            You're within the Da Nang sandbox zone
          </Text>

          <PrimaryButton title="Go to Wallet" onPress={handleContinue} />
        </View>
      </SafeAreaView>
    );
  }

  // Outside Sandbox
  if (state === 'outside') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-warning/10 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="location-off" size={56} color="#f59e0b" />
          </View>
          <Text className="text-2xl font-bold text-neutral-900 mb-2">
            Outside Sandbox Zone
          </Text>
          <Text className="text-neutral-500 text-center mb-4">
            VND conversion features require being within the Da Nang sandbox area
          </Text>
          <Text className="text-neutral-400 text-sm text-center mb-8">
            You can still view your balance and receive USDC
          </Text>

          <View className="w-full gap-4">
            <PrimaryButton
              title="Check Again"
              variant="outline"
              onPress={handleCheckLocation}
              isLoading={isLoading}
            />
            <PrimaryButton title="Continue Anyway" onPress={handleContinue} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Permission Denied
  if (state === 'denied') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-error/10 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="gps-off" size={56} color="#ef4444" />
          </View>
          <Text className="text-2xl font-bold text-neutral-900 mb-2">
            Location Access Denied
          </Text>
          <Text className="text-neutral-500 text-center mb-8">
            Enable location access in Settings to use VND conversion features
          </Text>

          <View className="w-full gap-4">
            <PrimaryButton
              title="Try Again"
              onPress={handleCheckLocation}
              isLoading={isLoading}
            />
            <TouchableOpacity onPress={handleContinue} className="items-center py-3">
              <Text className="text-neutral-500">Continue without location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Checking State
  if (state === 'checking') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="my-location" size={48} color="#8b5cf6" />
          </View>
          <Text className="text-2xl font-bold text-neutral-900 mb-2">
            Checking Location
          </Text>
          <Text className="text-neutral-500 text-center">
            Verifying you're within the sandbox zone...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Intro State
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="items-center mt-12 mb-8">
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="location-on" size={40} color="#8b5cf6" />
          </View>
          <Text className="text-2xl font-bold text-neutral-900 mb-2">
            Location Check
          </Text>
          <Text className="text-neutral-500 text-center">
            VND features available in sandbox zones only
          </Text>
        </View>

        {/* Info */}
        <View className="bg-neutral-50 rounded-card p-4 mb-6">
          <Text className="text-neutral-700 font-semibold mb-3">
            Why we need this:
          </Text>
          <Text className="text-neutral-600 text-sm leading-relaxed">
            Vietnam's crypto regulations require geographic verification. Phase 1 sandbox
            operates within a 500m radius of designated locations in Da Nang.
          </Text>
        </View>

        {/* Privacy Notice */}
        <View className="bg-info/10 rounded-card p-4 mb-8">
          <View className="flex-row items-start">
            <MaterialIcons name="privacy-tip" size={20} color="#3b82f6" />
            <Text className="text-neutral-700 ml-2 flex-1 text-sm">
              Your location is only checked once per session. We never store GPS coordinates.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="mt-auto mb-6 gap-4">
          <PrimaryButton
            title="Check My Location"
            onPress={handleCheckLocation}
            isLoading={isLoading}
          />

          <TouchableOpacity onPress={handleSkip} className="items-center py-3">
            <Text className="text-neutral-500">Skip for now (limited features)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
