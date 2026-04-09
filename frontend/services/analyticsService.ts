/**
 * AWay App - Firebase Analytics Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Add iOS and Android apps to your Firebase project
 * 3. Download configuration files:
 *    - google-services.json (Android) -> place in project root
 *    - GoogleService-Info.plist (iOS) -> place in project root
 * 4. Update app.json with the plugin configuration (see bottom of file)
 * 5. Run: npx expo prebuild
 * 
 * INSTALLATION:
 * npx expo install expo-build-properties @react-native-firebase/app @react-native-firebase/analytics
 */

// Note: Firebase Analytics requires native code, so we use a mock for development
// In production with a proper build, use @react-native-firebase/analytics

// Configuration flags
const ANALYTICS_ENABLED = false; // Set to true when Firebase is configured

// Mock analytics for development (replace with real Firebase in production build)
interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
  timestamp: Date;
}

const eventLog: AnalyticsEvent[] = [];

/**
 * Log a custom event
 */
export function logEvent(eventName: string, params?: Record<string, any>) {
  if (!ANALYTICS_ENABLED) {
    console.log(`[Analytics] Event: ${eventName}`, params);
    return;
  }

  // In production, use:
  // import analytics from '@react-native-firebase/analytics';
  // analytics().logEvent(eventName, params);
  
  eventLog.push({
    name: eventName,
    params,
    timestamp: new Date(),
  });
}

/**
 * Set current screen name for screen tracking
 */
export function logScreenView(screenName: string, screenClass?: string) {
  if (!ANALYTICS_ENABLED) {
    console.log(`[Analytics] Screen: ${screenName}`);
    return;
  }

  // In production:
  // analytics().logScreenView({ screen_name: screenName, screen_class: screenClass });
  
  logEvent('screen_view', { screen_name: screenName, screen_class: screenClass });
}

/**
 * Set user ID for cross-device tracking
 */
export function setUserId(userId: string | null) {
  if (!ANALYTICS_ENABLED) {
    console.log(`[Analytics] User ID: ${userId}`);
    return;
  }

  // In production:
  // analytics().setUserId(userId);
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, string>) {
  if (!ANALYTICS_ENABLED) {
    console.log('[Analytics] User properties:', properties);
    return;
  }

  // In production:
  // analytics().setUserProperties(properties);
}

// ==========================================
// Pre-defined Events for AWay App
// ==========================================

/**
 * Track user registration
 */
export function trackSignUp(method: string = 'email') {
  logEvent('sign_up', { method });
}

/**
 * Track user login
 */
export function trackLogin(method: string = 'email') {
  logEvent('login', { method });
}

/**
 * Track post creation
 */
export function trackCreatePost(hasImage: boolean) {
  logEvent('create_post', { has_image: hasImage });
}

/**
 * Track event creation
 */
export function trackCreateEvent(eventType: string) {
  logEvent('create_event', { event_type: eventType });
}

/**
 * Track ride join
 */
export function trackJoinRide(rideId: string) {
  logEvent('join_ride', { ride_id: rideId });
}

/**
 * Track track download
 */
export function trackDownloadTrack(trackId: string) {
  logEvent('download_track', { track_id: trackId });
}

/**
 * Track SOS activation
 */
export function trackSOSActivated(type: 'manual' | 'automatic') {
  logEvent('sos_activated', { activation_type: type });
}

/**
 * Track trip planner usage
 */
export function trackTripPlannerUsed(destination: string) {
  logEvent('trip_planner_used', { destination });
}

/**
 * Track vehicle added to garage
 */
export function trackVehicleAdded(brand: string, motoType: string) {
  logEvent('vehicle_added', { brand, moto_type: motoType });
}

/**
 * Track market listing created
 */
export function trackListingCreated(category: string, price: number) {
  logEvent('listing_created', { category, price });
}

/**
 * Track content share
 */
export function trackShare(contentType: string, contentId: string) {
  logEvent('share', { content_type: contentType, content_id: contentId });
}

/**
 * Track app errors (non-crash)
 */
export function trackError(errorType: string, errorMessage: string) {
  logEvent('app_error', { error_type: errorType, error_message: errorMessage });
}

/*
 * APP.JSON CONFIGURATION (add when Firebase files are ready):
 * 
 * {
 *   "expo": {
 *     "ios": {
 *       "googleServicesFile": "./GoogleService-Info.plist"
 *     },
 *     "android": {
 *       "googleServicesFile": "./google-services.json"
 *     },
 *     "plugins": [
 *       "@react-native-firebase/app",
 *       [
 *         "expo-build-properties",
 *         {
 *           "ios": {
 *             "useFrameworks": "static"
 *           }
 *         }
 *       ]
 *     ]
 *   }
 * }
 */

export default {
  logEvent,
  logScreenView,
  setUserId,
  setUserProperties,
  trackSignUp,
  trackLogin,
  trackCreatePost,
  trackCreateEvent,
  trackJoinRide,
  trackDownloadTrack,
  trackSOSActivated,
  trackTripPlannerUsed,
  trackVehicleAdded,
  trackListingCreated,
  trackShare,
  trackError,
};
