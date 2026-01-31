import * as Location from 'expo-location';
import { isWithinSandbox, DEV_MODE } from '../constants/sandbox-location-validator';

export interface LocationResult {
  granted: boolean;
  withinSandbox: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}

export const requestLocationPermission = async (): Promise<boolean> => {
  // In DEV_MODE, auto-approve for demo
  if (DEV_MODE) {
    return true;
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const checkLocationStatus = async (): Promise<LocationResult> => {
  // DEV_MODE: Auto-approve for hackathon demo
  if (DEV_MODE) {
    return {
      granted: true,
      withinSandbox: true,
      latitude: 16.0544, // Da Nang coordinates
      longitude: 108.2022,
    };
  }

  try {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== 'granted') {
      return {
        granted: false,
        withinSandbox: false,
        error: 'Location permission not granted',
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;
    const withinSandbox = isWithinSandbox(latitude, longitude);

    return {
      granted: true,
      withinSandbox,
      latitude,
      longitude,
    };
  } catch (error) {
    return {
      granted: false,
      withinSandbox: false,
      error: error instanceof Error ? error.message : 'Location check failed',
    };
  }
};
