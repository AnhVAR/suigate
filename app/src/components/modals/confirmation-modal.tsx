import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { PrimaryButton } from '../buttons/primary-button';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl w-full max-w-sm p-6">
          <Text className="text-xl font-bold text-neutral-900 text-center mb-2">
            {title}
          </Text>

          <Text className="text-neutral-600 text-center mb-6">
            {message}
          </Text>

          <View className="gap-3">
            <PrimaryButton
              title={confirmText}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              isLoading={isLoading}
              onPress={onConfirm}
            />

            <TouchableOpacity
              onPress={onCancel}
              disabled={isLoading}
              className="h-13 items-center justify-center"
            >
              <Text className="text-neutral-600 font-medium text-base">
                {cancelText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
