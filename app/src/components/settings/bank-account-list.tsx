import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BankAccount } from '../../types/transaction.types';
import { useBankAccountStore } from '../../stores/bank-account-store';

interface BankAccountListProps {
  accounts: BankAccount[];
  onEdit: (account: BankAccount) => void;
  onAddNew: () => void;
}

export const BankAccountList: React.FC<BankAccountListProps> = ({
  accounts,
  onEdit,
  onAddNew,
}) => {
  const { deleteAccount, setPrimary } = useBankAccountStore();

  const handleDelete = (account: BankAccount) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to remove ${account.bankName} account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAccount(account.id),
        },
      ]
    );
  };

  const handleSetPrimary = (account: BankAccount) => {
    if (!account.isPrimary) {
      setPrimary(account.id);
    }
  };

  if (accounts.length === 0) {
    return (
      <View className="bg-white rounded-xl p-6 items-center">
        <MaterialIcons name="account-balance" size={48} color="#d1d5db" />
        <Text className="text-neutral-500 mt-2">No bank accounts</Text>
        <TouchableOpacity onPress={onAddNew} className="mt-4">
          <Text className="text-primary-500 font-medium">Add your first account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl">
      {accounts.map((account, index) => (
        <View
          key={account.id}
          className={`p-4 ${index < accounts.length - 1 ? 'border-b border-neutral-100' : ''}`}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
              <Text className="text-primary-700 font-bold">{account.bankCode}</Text>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-neutral-900 font-medium">{account.bankName}</Text>
                {account.isPrimary && (
                  <View className="bg-primary-100 px-2 py-0.5 rounded-full ml-2">
                    <Text className="text-primary-700 text-xs">Primary</Text>
                  </View>
                )}
              </View>
              <Text className="text-neutral-500 text-sm">{account.accountNumber}</Text>
              <Text className="text-neutral-400 text-xs">{account.accountHolder}</Text>
            </View>

            <View className="flex-row">
              {!account.isPrimary && (
                <TouchableOpacity
                  onPress={() => handleSetPrimary(account)}
                  className="p-2 mr-1"
                >
                  <MaterialIcons name="star-outline" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => onEdit(account)} className="p-2 mr-1">
                <MaterialIcons name="edit" size={20} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(account)} className="p-2">
                <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* Add New Button */}
      <TouchableOpacity
        onPress={onAddNew}
        className="flex-row items-center justify-center p-4 border-t border-neutral-100"
      >
        <MaterialIcons name="add" size={20} color="#8b5cf6" />
        <Text className="text-primary-500 font-medium ml-1">Add Account</Text>
      </TouchableOpacity>
    </View>
  );
};
