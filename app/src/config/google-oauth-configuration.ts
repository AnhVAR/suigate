/**
 * Google OAuth configuration for zkLogin
 * Client IDs obtained from Google Cloud Console > APIs & Services > Credentials
 */

export const GOOGLE_OAUTH_CONFIG = {
  // Web client ID (used for Expo Go development)
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',

  // Android client ID (for production Android builds)
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',

  // iOS client ID (for production iOS builds)
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',

  // OAuth scopes required for zkLogin
  scopes: ['openid', 'email', 'profile'],

  // Redirect scheme (matches app.json scheme)
  scheme: 'suigate',
};

/**
 * Google OAuth discovery document endpoints
 */
export const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};
