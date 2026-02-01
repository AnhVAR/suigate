/**
 * Network Connectivity Status Hook
 * Detects online/offline state using NetInfo
 */

import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  isOnline: boolean;
  isInternetReachable: boolean | null;
}

/**
 * Hook to monitor network connectivity status
 */
export const useNetworkConnectivityStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
    isInternetReachable: null,
  });

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      setNetworkStatus({
        isOnline: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
      });
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkStatus({
        isOnline: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
};
