import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ActionItem {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bgColor: string;
  route?: string;
  disabled?: boolean;
}

interface QuickActionsGridProps {
  canAccessVnd: boolean;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  canAccessVnd,
}) => {
  const router = useRouter();

  const actions: ActionItem[] = [
    {
      id: 'buy',
      title: 'Buy USDC',
      icon: 'add-circle',
      color: '#10b981',
      bgColor: '#d1fae5',
      route: '/(tabs)/convert?mode=buy',
      disabled: !canAccessVnd,
    },
    {
      id: 'quick-sell',
      title: 'Quick Sell',
      icon: 'flash-on',
      color: '#ef4444',
      bgColor: '#fee2e2',
      route: '/(tabs)/convert?mode=quick-sell',
      disabled: !canAccessVnd,
    },
    {
      id: 'smart-sell',
      title: 'Smart Sell',
      icon: 'trending-up',
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      route: '/(tabs)/convert?mode=smart-sell',
      disabled: !canAccessVnd,
    },
    {
      id: 'history',
      title: 'History',
      icon: 'history',
      color: '#6b7280',
      bgColor: '#f3f4f6',
      route: '/(tabs)/history',
    },
  ];

  const handlePress = (action: ActionItem) => {
    if (action.disabled) return;
    if (action.route) {
      router.push(action.route as any);
    }
  };

  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <View key={action.id} style={styles.gridItem}>
          <TouchableOpacity
            onPress={() => handlePress(action)}
            disabled={action.disabled}
            style={[styles.card, action.disabled && styles.cardDisabled]}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
              <MaterialIcons name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={styles.title}>{action.title}</Text>
            {action.disabled && (
              <Text style={styles.disabledText}>Verify location</Text>
            )}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#1f2937',
    fontWeight: '500',
    fontSize: 14,
  },
  disabledText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
});
