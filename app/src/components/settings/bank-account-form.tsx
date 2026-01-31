import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TextInput } from '../inputs/text-input';
import { PrimaryButton } from '../buttons/primary-button';
import { VIETNAM_BANKS, useBankAccountStore } from '../../stores/bank-account-store';

interface BankAccountFormProps {
  visible: boolean;
  onClose: () => void;
  editAccount?: {
    id: number;
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export const BankAccountForm: React.FC<BankAccountFormProps> = ({
  visible,
  onClose,
  editAccount,
}) => {
  const { addAccount, updateAccount } = useBankAccountStore();

  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editAccount changes
  useEffect(() => {
    if (visible) {
      setBankCode(editAccount?.bankCode || '');
      setAccountNumber(editAccount?.accountNumber || '');
      setAccountHolder(editAccount?.accountHolder || '');
    }
  }, [visible, editAccount]);

  const selectedBank = VIETNAM_BANKS.find((b) => b.code === bankCode);

  const handleSubmit = async () => {
    if (!bankCode || !accountNumber || !accountHolder) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!/^\d{6,20}$/.test(accountNumber)) {
      Alert.alert('Error', 'Invalid account number format');
      return;
    }

    setIsSubmitting(true);

    try {
      const bankName = VIETNAM_BANKS.find((b) => b.code === bankCode)?.name || bankCode;

      if (editAccount) {
        await updateAccount(editAccount.id, {
          bankCode,
          bankName,
          accountNumber,
          accountHolder: accountHolder.toUpperCase(),
        });
      } else {
        await addAccount({
          bankCode,
          bankName,
          accountNumber,
          accountHolder: accountHolder.toUpperCase(),
          isPrimary: false,
        });
      }

      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save bank account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-neutral-500">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold">
            {editAccount ? 'Edit Account' : 'Add Bank Account'}
          </Text>
          <View className="w-12" />
        </View>

        <ScrollView className="flex-1 p-5">
          {/* Bank Selection */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Bank</Text>
            <TouchableOpacity
              onPress={() => setShowBankPicker(true)}
              className="flex-row items-center justify-between bg-neutral-50 rounded-xl border border-neutral-200 p-4"
            >
              {selectedBank ? (
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-primary-700 font-bold text-sm">
                      {selectedBank.code}
                    </Text>
                  </View>
                  <Text className="text-neutral-900">{selectedBank.name}</Text>
                </View>
              ) : (
                <Text className="text-neutral-500">Select bank</Text>
              )}
              <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Account Number */}
          <View className="mb-6">
            <TextInput
              label="Account Number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
              placeholder="Enter account number"
            />
          </View>

          {/* Account Holder */}
          <View className="mb-6">
            <TextInput
              label="Account Holder Name"
              value={accountHolder}
              onChangeText={setAccountHolder}
              autoCapitalize="characters"
              placeholder="NGUYEN VAN A"
              hint="Enter name exactly as shown on bank account"
            />
          </View>

          {/* Submit */}
          <PrimaryButton
            title={editAccount ? 'Save Changes' : 'Add Account'}
            onPress={handleSubmit}
            isLoading={isSubmitting}
          />
        </ScrollView>

        {/* Bank Picker Modal */}
        <Modal
          visible={showBankPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowBankPicker(false)}
        >
          <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
              <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Select Bank</Text>
              <View className="w-6" />
            </View>

            <ScrollView className="flex-1 p-4">
              {VIETNAM_BANKS.map((bank) => (
                <TouchableOpacity
                  key={bank.code}
                  onPress={() => {
                    setBankCode(bank.code);
                    setShowBankPicker(false);
                  }}
                  className={`flex-row items-center p-4 mb-2 rounded-xl border ${
                    bankCode === bank.code ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
                  }`}
                >
                  <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-primary-700 font-bold">{bank.code}</Text>
                  </View>
                  <Text className="text-neutral-900 flex-1">{bank.name}</Text>
                  {bankCode === bank.code && (
                    <MaterialIcons name="check-circle" size={24} color="#8b5cf6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};
