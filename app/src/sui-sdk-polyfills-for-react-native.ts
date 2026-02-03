/**
 * Polyfills for @mysten/sui SDK - MUST be imported before any Sui imports
 * These provide missing globals required by the SDK in React Native
 */

// URL polyfill - required for URL parsing
import 'react-native-url-polyfill/auto';

// TextEncoder/TextDecoder - required by Sui SDK for encoding operations
import 'fast-text-encoding';

// crypto.getRandomValues - required for key generation
import 'react-native-get-random-values';

// Buffer global - required for binary operations
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// Process global - required by some dependencies
import process from 'process';
// @ts-expect-error - Setting global process for compatibility
global.process = process;
