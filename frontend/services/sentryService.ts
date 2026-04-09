/**
 * AWay App - Sentry Error Tracking Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Sentry account at https://sentry.io
 * 2. Create a new React Native project
 * 3. Copy your DSN from Settings > Client Keys
 * 4. Replace 'YOUR_SENTRY_DSN' below with your actual DSN
 * 5. Add to app.json plugins (see comments below)
 * 
 * For EAS Build integration, run:
 * npx @sentry/wizard@latest -i reactNative
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Configuration flags
const SENTRY_ENABLED = false; // Set to true when DSN is configured
const SENTRY_DSN = 'YOUR_SENTRY_DSN'; // Replace with your actual Sentry DSN

/**
 * Initialize Sentry error tracking
 * Call this early in your app's lifecycle (e.g., in _layout.tsx)
 */
export function initSentry() {
  if (!SENTRY_ENABLED || SENTRY_DSN === 'YOUR_SENTRY_DSN') {
    console.log('[Sentry] Skipped initialization - DSN not configured');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    enableNative: true,
    debug: __DEV__,
    // Performance Monitoring
    tracesSampleRate: __DEV__ ? 1.0 : 0.2, // Lower in production
    // Session Replay (optional)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  // Add EAS Update metadata for better tracking
  if (Constants.expoConfig?.updates) {
    Sentry.setTag('expoUpdateId', Constants.expoConfig.updates.updateId || 'unknown');
  }

  // Set app version
  if (Constants.expoConfig?.version) {
    Sentry.setTag('appVersion', Constants.expoConfig.version);
  }

  console.log('[Sentry] Initialized successfully');
}

/**
 * Capture a custom error
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (!SENTRY_ENABLED) return;
  
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Capture a custom message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!SENTRY_ENABLED) return;
  
  Sentry.captureMessage(message, level);
}

/**
 * Set user information for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (!SENTRY_ENABLED) return;
  
  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  if (!SENTRY_ENABLED) return;
  
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Test Sentry integration (use only in development)
 */
export function testSentry() {
  if (!SENTRY_ENABLED) {
    console.log('[Sentry] Cannot test - not enabled');
    return;
  }
  
  Sentry.captureException(new Error('Test error from AWay app'));
  console.log('[Sentry] Test error sent - check your Sentry dashboard');
}

/*
 * APP.JSON PLUGIN CONFIGURATION (add when ready):
 * 
 * "plugins": [
 *   ["@sentry/react-native/expo", {
 *     "organization": "your-org-slug",
 *     "project": "away-app"
 *   }]
 * ]
 * 
 * INSTALLATION:
 * npx expo install @sentry/react-native
 */

export default {
  initSentry,
  captureError,
  captureMessage,
  setUser,
  addBreadcrumb,
  testSentry,
};
