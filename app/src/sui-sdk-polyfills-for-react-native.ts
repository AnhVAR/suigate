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
global.process = process;

// EventTarget polyfill - required by Sui SDK client
import { EventTarget } from 'event-target-shim';
if (typeof global.EventTarget === 'undefined') {
  (global as any).EventTarget = EventTarget;
}

// AbortController polyfill - required by Sui SDK fetch operations
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';

// Ensure Headers, Request, Response are available (should be from React Native)
if (typeof global.Headers === 'undefined') {
  (global as any).Headers = class Headers extends Map {};
}
