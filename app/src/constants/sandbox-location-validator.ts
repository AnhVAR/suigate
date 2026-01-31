/**
 * Da Nang sandbox phase 1
 * 500m radius from specific locations
 *
 * DEV_MODE: Auto-approve for hackathon demo
 */

export const DEV_MODE = true; // Set to false for production

export const SANDBOX_LOCATIONS = [
  {
    name: 'Da Nang Tech Hub',
    latitude: 16.0544,
    longitude: 108.2022,
    radiusMeters: 500,
  },
  {
    name: 'Demo Location (Dev)',
    latitude: 0, // Will be set to current location for testing
    longitude: 0,
    radiusMeters: 1000,
  },
];

export const DEFAULT_RADIUS_METERS = 500;

// Haversine formula for distance calculation
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const isWithinSandbox = (latitude: number, longitude: number): boolean => {
  return SANDBOX_LOCATIONS.some((location) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      location.latitude,
      location.longitude
    );
    return distance <= location.radiusMeters;
  });
};
