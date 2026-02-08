import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authentication-store';
import { PrimaryButton } from '../../src/components';

type KycStep = 'intro' | 'verifying' | 'success';

export default function KycVerificationScreen() {
  const [step, setStep] = useState<KycStep>('intro');
  const setKycStatus = useAuthStore((state) => state.setKycStatus);
  const router = useRouter();

  const handleStartKyc = async () => {
    setStep('verifying');

    // Mock KYC verification (auto-approve after delay)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await setKycStatus('verified');
    setStep('success');
  };

  const handleContinue = () => {
    router.replace('/(auth)/location-check');
  };

  const handleSkip = () => {
    router.replace('/(tabs)/wallet');
  };

  if (step === 'verifying') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="verified-user" size={48} color="#8b5cf6" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center', width: '100%' }}>
            Verifying Identity
          </Text>
          <Text style={{ color: '#6b7280', textAlign: 'center', width: '100%' }}>
            Please wait while we verify your information...
          </Text>

          <View className="mt-8">
            <View className="w-48 h-1 bg-neutral-200 rounded-full overflow-hidden">
              <View className="w-1/2 h-full bg-primary-500" />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'success') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-success/10 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="check-circle" size={56} color="#22c55e" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center', width: '100%' }}>
            Verification Complete
          </Text>
          <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 32, width: '100%' }}>
            Your identity has been verified successfully
          </Text>

          <PrimaryButton title="Continue" onPress={handleContinue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="items-center mt-12 mb-8">
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="badge" size={40} color="#8b5cf6" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center', width: '100%' }}>
            Verify Your Identity
          </Text>
          <Text style={{ color: '#6b7280', textAlign: 'center', width: '100%' }}>
            Required to access VND conversion features
          </Text>
        </View>

        {/* Requirements List */}
        <View className="bg-neutral-50 rounded-card p-4 mb-6">
          <Text className="font-semibold mb-3" style={{ color: '#374151' }}>
            What you'll need:
          </Text>
          {['Government-issued ID', 'Clear selfie photo', 'Valid email address'].map(
            (item, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <MaterialIcons name="check-circle" size={18} color="#22c55e" />
                <Text className="ml-2" style={{ color: '#4b5563' }}>{item}</Text>
              </View>
            )
          )}
        </View>

        {/* Demo Notice */}
        <View className="bg-warning/10 rounded-card p-4 mb-8">
          <View className="flex-row items-start">
            <MaterialIcons name="info" size={20} color="#f59e0b" />
            <Text className="ml-2 flex-1 text-sm" style={{ color: '#374151' }}>
              <Text className="font-semibold">Demo Mode: </Text>
              KYC will auto-approve. Real FPT.AI integration planned for production.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="mt-auto mb-6 gap-4">
          <PrimaryButton title="Start Verification" onPress={handleStartKyc} />

          <TouchableOpacity onPress={handleSkip} className="items-center py-3">
            <Text style={{ color: '#6b7280' }}>
              Skip for now (limited features)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
