import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Clipboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BalanceCardProps {
  usdcBalance: number;
  vndEquivalent: number;
  walletAddress?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const formatUsdc = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatVnd = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

export const BalanceCard: React.FC<BalanceCardProps> = ({
  usdcBalance,
  vndEquivalent,
  walletAddress,
  isLoading,
  onRefresh,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (!walletAddress) return;
    Clipboard.setString(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length < 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>Total Balance</Text>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} disabled={isLoading}>
            <MaterialIcons name="refresh" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        )}
      </View>

      {/* USDC Balance */}
      <View style={styles.balanceRow}>
        {isLoading ? (
          <View style={styles.skeleton} />
        ) : (
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{formatUsdc(usdcBalance)}</Text>
            <Text style={styles.currency}>USDC</Text>
          </View>
        )}
      </View>

      {/* VND Equivalent */}
      <View style={styles.equivalentRow}>
        <MaterialIcons name="swap-vert" size={16} color="rgba(255,255,255,0.6)" />
        {isLoading ? (
          <View style={styles.skeletonSmall} />
        ) : (
          <Text style={styles.equivalent}>
            {'\u2248'} {formatVnd(vndEquivalent)} VND
          </Text>
        )}
      </View>

      {/* Wallet Address with Copy */}
      {walletAddress && (
        <TouchableOpacity
          style={styles.addressRow}
          onPress={handleCopyAddress}
          activeOpacity={0.7}
        >
          <Text style={styles.addressText}>{truncateAddress(walletAddress)}</Text>
          <View style={styles.copyButton}>
            <MaterialIcons
              name={copied ? 'check' : 'content-copy'}
              size={14}
              color={copied ? '#22c55e' : 'rgba(255,255,255,0.7)'}
            />
            {copied && <Text style={styles.copiedText}>Copied!</Text>}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    color: '#ddd6fe',
    fontSize: 14,
  },
  balanceRow: {
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amount: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '700',
  },
  currency: {
    color: '#ddd6fe',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  equivalentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equivalent: {
    color: '#ddd6fe',
    fontSize: 16,
    marginLeft: 4,
  },
  skeleton: {
    height: 56,
    backgroundColor: '#a78bfa',
    borderRadius: 8,
  },
  skeletonSmall: {
    height: 20,
    width: 128,
    backgroundColor: '#a78bfa',
    borderRadius: 4,
    marginLeft: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  addressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'flex-end',
  },
  copiedText: {
    color: '#22c55e',
    fontSize: 12,
    marginLeft: 4,
  },
});
