/**
 * Component Usage Examples
 * This file demonstrates how to use all reusable components
 * Can be used as reference when building screens
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import {
  PrimaryButton,
  BaseCard,
  TextInput,
  AmountInput,
  ConfirmationModal,
  StatusBadge,
  LoadingSpinner,
} from './index';

export const ComponentExamples = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');

  return (
    <View className="flex-1 p-4 bg-white">
      {/* Button Examples */}
      <BaseCard className="mb-4">
        <PrimaryButton title="Primary Button" variant="primary" />
        <PrimaryButton title="Secondary" variant="secondary" className="mt-2" />
        <PrimaryButton title="Outline" variant="outline" className="mt-2" />
        <PrimaryButton title="Danger" variant="danger" className="mt-2" />
        <PrimaryButton
          title="With Icon"
          leftIcon={<MaterialIcons name="account-balance-wallet" size={20} color="white" />}
          className="mt-2"
        />
        <PrimaryButton title="Loading" isLoading className="mt-2" />
      </BaseCard>

      {/* Card Examples */}
      <BaseCard variant="elevated" padding="md" className="mb-4">
        <TextInput label="Email" placeholder="Enter your email" />
      </BaseCard>

      <BaseCard variant="outlined" padding="lg" className="mb-4">
        <TextInput
          label="Password"
          placeholder="Enter password"
          secureTextEntry
          error="Password is required"
        />
      </BaseCard>

      {/* Amount Input Example */}
      <BaseCard className="mb-4">
        <AmountInput
          value={amount}
          onChangeValue={setAmount}
          currency="USDC"
          label="Amount"
          maxAmount={1000}
          showMaxButton
          equivalentValue="23,450,000"
          equivalentCurrency="VND"
        />
      </BaseCard>

      {/* Status Badges */}
      <BaseCard className="mb-4">
        <View className="flex-row flex-wrap gap-2">
          <StatusBadge status="pending" />
          <StatusBadge status="processing" />
          <StatusBadge status="success" />
          <StatusBadge status="failed" />
          <StatusBadge status="cancelled" />
        </View>
      </BaseCard>

      {/* Loading Spinner */}
      <BaseCard className="mb-4">
        <LoadingSpinner message="Loading..." />
      </BaseCard>

      {/* Modal Trigger */}
      <PrimaryButton
        title="Show Modal"
        onPress={() => setModalVisible(true)}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={modalVisible}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        confirmText="Yes, Continue"
        cancelText="Cancel"
        variant="default"
        onConfirm={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
};
