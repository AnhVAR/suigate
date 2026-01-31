import { View, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authentication-store';
import { useBankAccountStore } from '../../src/stores/bank-account-store';
import { SettingsSection, SettingsItem } from '../../src/components/settings/settings-section';
import { BankAccountList } from '../../src/components/settings/bank-account-list';
import { BankAccountForm } from '../../src/components/settings/bank-account-form';
import { BankAccount } from '../../src/types/transaction.types';

export default function SettingsScreen() {
  const router = useRouter();
  const { suiAddress, email, kycStatus, locationStatus, logout } = useAuthStore();
  const { accounts, loadAccounts } = useBankAccountStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'vi' : 'en';
    setLanguage(newLang);
    // TODO: Implement actual i18n switch
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditAccount(account);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditAccount(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsItem
            icon="person"
            label="Email"
            value={email || 'Not set'}
            showArrow={false}
          />
          <SettingsItem
            icon="account-balance-wallet"
            label="Wallet Address"
            value={suiAddress ? `${suiAddress.slice(0, 8)}...${suiAddress.slice(-6)}` : ''}
            showArrow={false}
          />
          <SettingsItem
            icon="verified-user"
            label="KYC Status"
            value={kycStatus === 'verified' ? 'Verified' : 'Not Verified'}
            showArrow={false}
          />
          <SettingsItem
            icon="location-on"
            label="Location Status"
            value={locationStatus === 'within_sandbox' ? 'In Sandbox' : 'Not Verified'}
            showArrow={false}
          />
        </SettingsSection>

        {/* Bank Accounts Section */}
        <SettingsSection title="Bank Accounts">
          <View className="-mx-4">
            <BankAccountList
              accounts={accounts}
              onEdit={handleEditAccount}
              onAddNew={() => setShowAddForm(true)}
            />
          </View>
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
          <SettingsItem
            icon="language"
            label="Language"
            value={language === 'en' ? 'English' : 'Tiếng Việt'}
            onPress={handleLanguageToggle}
          />
          <SettingsItem
            icon="notifications"
            label="Notifications"
            onPress={() => {}}
          />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support">
          <SettingsItem icon="help-outline" label="Help Center" onPress={() => {}} />
          <SettingsItem icon="description" label="Terms of Service" onPress={() => {}} />
          <SettingsItem icon="privacy-tip" label="Privacy Policy" onPress={() => {}} />
        </SettingsSection>

        {/* Logout */}
        <SettingsSection title="">
          <SettingsItem
            icon="logout"
            label="Logout"
            onPress={handleLogout}
            danger
            showArrow={false}
          />
        </SettingsSection>
      </ScrollView>

      {/* Bank Account Form Modal */}
      <BankAccountForm
        visible={showAddForm}
        onClose={handleCloseForm}
        editAccount={editAccount || undefined}
      />
    </SafeAreaView>
  );
}
