const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Node.js module polyfills for @mysten/sui SDK
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process/browser'),
};

module.exports = withNativeWind(config, { input: './global.css' });
