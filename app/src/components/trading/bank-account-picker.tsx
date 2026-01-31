/**
 * Bank Account Picker Component
 * Modal-based selector for linked bank accounts (mock data)
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BankAccount {
  id: number;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isPrimary: boolean;
}

interface BankAccountPickerProps {
  accounts?: BankAccount[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAddNew?: () => void;
}

// Mock bank accounts for demo
const mockAccounts: BankAccount[] = [
  {
    id: 1,
    bankCode: 'VCB',
    bankName: 'Vietcombank',
    accountNumber: '****6789',
    accountHolder: 'NGUYEN VAN A',
    isPrimary: true,
  },
  {
    id: 2,
    bankCode: 'TCB',
    bankName: 'Techcombank',
    accountNumber: '****4321',
    accountHolder: 'NGUYEN VAN A',
    isPrimary: false,
  },
];

export const BankAccountPicker: React.FC<BankAccountPickerProps> = ({
  accounts = mockAccounts,
  selectedId,
  onSelect,
  onAddNew,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === selectedId);

  const handleSelect = (id: number) => {
    onSelect(id);
    setIsModalVisible(false);
  };

  return (
    <View>
      <Text className="text-sm font-medium text-neutral-700 mb-2">
        Bank Account
      </Text>

      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center justify-between bg-neutral-50 rounded-xl border border-neutral-200 p-4"
      >
        {selectedAccount ? (
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
              <Text className="text-primary-700 font-bold text-sm">
                {selectedAccount.bankCode}
              </Text>
            </View>
            <View>
              <Text className="text-neutral-900 font-medium">
                {selectedAccount.bankName}
              </Text>
              <Text className="text-neutral-500 text-sm">
                {selectedAccount.accountNumber}
              </Text>
            </View>
          </View>
        ) : (
          <Text className="text-neutral-500">Select bank account</Text>
        )}

        <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text className="text-neutral-500">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Select Account</Text>
            <View className="w-12" />
          </View>

          {/* Account List */}
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item.id)}
                className={`flex-row items-center p-4 mb-3 rounded-xl border ${
                  selectedId === item.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-primary-700 font-bold">
                    {item.bankCode}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-neutral-900 font-medium">
                      {item.bankName}
                    </Text>
                    {item.isPrimary && (
                      <View className="bg-primary-100 px-2 py-0.5 rounded-full ml-2">
                        <Text className="text-primary-700 text-xs">
                          Primary
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-neutral-500 text-sm">
                    {item.accountNumber}
                  </Text>
                  <Text className="text-neutral-400 text-xs">
                    {item.accountHolder}
                  </Text>
                </View>
                {selectedId === item.id && (
                  <MaterialIcons name="check-circle" size={24} color="#8b5cf6" />
                )}
              </TouchableOpacity>
            )}
            ListFooterComponent={
              onAddNew ? (
                <TouchableOpacity
                  onPress={onAddNew}
                  className="flex-row items-center justify-center p-4 border border-dashed border-neutral-300 rounded-xl mt-2"
                >
                  <MaterialIcons name="add" size={20} color="#8b5cf6" />
                  <Text className="text-primary-500 font-medium ml-2">
                    Add New Account
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />
        </View>
      </Modal>
    </View>
  );
};
