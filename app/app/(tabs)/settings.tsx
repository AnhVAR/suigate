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
import { useTranslation } from '../../src/i18n/hooks/use-translation';
import { changeLanguage, getCurrentLanguage } from '../../src/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { suiAddress, email, kycStatus, locationStatus, logout } = useAuthStore();
  const { accounts, loadAccounts } = useBankAccountStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [language, setLanguage] = useState(getCurrentLanguage());

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleLanguageToggle = async () => {
    const newLang = language === 'en' ? 'vi' : 'en';
    await changeLanguage(newLang as 'en' | 'vi');
    setLanguage(newLang);
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
        <SettingsSection title={t('settings.account')}>
          <SettingsItem
            icon="person"
            label={t('settings.email')}
            value={email || 'Not set'}
            showArrow={false}
          />
          <SettingsItem
            icon="account-balance-wallet"
            label={t('settings.walletAddress')}
            value={suiAddress ? `${suiAddress.slice(0, 8)}...${suiAddress.slice(-6)}` : ''}
            showArrow={false}
          />
          <SettingsItem
            icon="verified-user"
            label={t('settings.kycStatus')}
            value={kycStatus === 'verified' ? t('settings.verified') : t('settings.notVerified')}
            showArrow={false}
          />
          <SettingsItem
            icon="location-on"
            label={t('settings.locationStatus')}
            value={locationStatus === 'within_sandbox' ? t('settings.inSandbox') : t('settings.notVerified')}
            showArrow={false}
          />
        </SettingsSection>

        {/* Bank Accounts Section */}
        <SettingsSection title={t('settings.bankAccounts')}>
          <View className="-mx-4">
            <BankAccountList
              accounts={accounts}
              onEdit={handleEditAccount}
              onAddNew={() => setShowAddForm(true)}
            />
          </View>
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title={t('settings.preferences')}>
          <SettingsItem
            icon="language"
            label={t('settings.language')}
            value={language === 'en' ? 'English' : 'Tiếng Việt'}
            onPress={handleLanguageToggle}
          />
          <SettingsItem
            icon="notifications"
            label={t('settings.notifications')}
            onPress={() => {}}
          />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title={t('settings.support')}>
          <SettingsItem icon="help-outline" label={t('settings.helpCenter')} onPress={() => {}} />
          <SettingsItem icon="description" label={t('settings.termsOfService')} onPress={() => {}} />
          <SettingsItem icon="privacy-tip" label={t('settings.privacyPolicy')} onPress={() => {}} />
        </SettingsSection>

        {/* Logout */}
        <SettingsSection title="">
          <SettingsItem
            icon="logout"
            label={t('settings.logout')}
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
