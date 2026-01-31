import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * React Error Boundary component for catching and displaying errors.
 * Provides retry functionality to recover from errors.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center p-6 bg-white">
          <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="error" size={40} color="#ef4444" />
          </View>

          <Text className="text-xl font-bold text-neutral-900 mb-2">
            Something went wrong
          </Text>

          <Text className="text-neutral-500 text-center mb-6">
            We're sorry, but something unexpected happened.
          </Text>

          <TouchableOpacity
            onPress={this.handleRetry}
            className="bg-primary-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
