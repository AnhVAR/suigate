/**
 * Bank Account Picker Component
 * Modal-based selector for linked bank accounts
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { BankAccount } from '../../types/transaction.types';

interface BankAccountPickerProps {
  accounts: BankAccount[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAddNew?: () => void;
  isLoading?: boolean;
}

export const BankAccountPicker: React.FC<BankAccountPickerProps> = ({
  accounts,
  selectedId,
  onSelect,
  onAddNew,
  isLoading = false,
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

      <Pressable
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center justify-between bg-neutral-50 rounded-xl border border-neutral-200 p-4"
      >
        {isLoading ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#8b5cf6" />
            <Text className="text-neutral-500 ml-2">Loading accounts...</Text>
          </View>
        ) : selectedAccount ? (
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
        ) : accounts.length === 0 ? (
          <Text className="text-amber-600">No bank account linked</Text>
        ) : (
          <Text className="text-neutral-500">Select bank account</Text>
        )}

        <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
      </Pressable>

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
            <Pressable onPress={() => setIsModalVisible(false)}>
              <Text className="text-neutral-500">Cancel</Text>
            </Pressable>
            <Text className="text-lg font-semibold">Select Account</Text>
            <View className="w-12" />
          </View>

          {/* Account List */}
          <ScrollView className="flex-1 p-4">
            {isLoading && (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text className="text-neutral-500 mt-2">Loading accounts...</Text>
              </View>
            )}
            {!isLoading && accounts.length === 0 && (
              <View className="items-center py-8">
                <MaterialIcons name="account-balance" size={48} color="#d1d5db" />
                <Text className="text-neutral-500 mt-2">No bank accounts linked</Text>
                <Text className="text-neutral-400 text-sm mt-1">Add a bank account to receive VND</Text>
              </View>
            )}
            {accounts.map((item) => (
              <Pressable
                key={item.id}
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
              </Pressable>
            ))}
            {onAddNew && (
              <Pressable
                onPress={onAddNew}
                className="flex-row items-center justify-center p-4 border border-dashed border-neutral-300 rounded-xl mt-2"
              >
                <MaterialIcons name="add" size={20} color="#8b5cf6" />
                <Text className="text-primary-500 font-medium ml-2">
                  Add New Account
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};
