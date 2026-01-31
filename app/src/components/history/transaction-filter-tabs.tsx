import React from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { OrderType } from '../../types/transaction.types';

interface FilterTabsProps {
  selected: OrderType | 'all';
  onSelect: (filter: OrderType | 'all') => void;
}

const filters: { value: OrderType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'buy', label: 'Buy' },
  { value: 'quick_sell', label: 'Quick Sell' },
  { value: 'smart_sell', label: 'Smart Sell' },
];

export const TransactionFilterTabs: React.FC<FilterTabsProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {filters.map((filter, index) => {
        const isSelected = selected === filter.value;
        return (
          <TouchableOpacity
            key={filter.value}
            onPress={() => onSelect(filter.value)}
            style={[
              styles.tab,
              isSelected ? styles.tabSelected : styles.tabUnselected,
              index < filters.length - 1 && styles.tabMargin,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                isSelected ? styles.tabTextSelected : styles.tabTextUnselected,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabSelected: {
    backgroundColor: '#8b5cf6',
  },
  tabUnselected: {
    backgroundColor: '#f5f5f5',
  },
  tabMargin: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextSelected: {
    color: '#ffffff',
  },
  tabTextUnselected: {
    color: '#525252',
  },
});
