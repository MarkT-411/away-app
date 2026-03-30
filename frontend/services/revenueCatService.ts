import { Platform } from 'react-native';
import Purchases, { 
  LOG_LEVEL, 
  CustomerInfo, 
  PurchasesOfferings,
  PurchasesPackage,
  PurchasesError,
  PURCHASES_ERROR_CODE
} from 'react-native-purchases';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';
const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || 'away_premium';

// Product identifiers
export const PRODUCT_IDS = {
  MONTHLY: 'away_premium_monthly',
  YEARLY: 'away_premium_yearly',
};

// Initialize RevenueCat SDK
export const initializeRevenueCat = async (appUserId?: string): Promise<void> => {
  try {
    // Set log level for debugging (use WARN or ERROR in production)
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    } else {
      Purchases.setLogLevel(LOG_LEVEL.WARN);
    }

    // Configure the SDK
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: appUserId,
    });

    console.log('[RevenueCat] SDK initialized successfully');
  } catch (error) {
    console.error('[RevenueCat] Initialization failed:', error);
    throw error;
  }
};

// Login user with custom ID (call after user authentication)
export const loginUser = async (userId: string): Promise<CustomerInfo> => {
  try {
    const { customerInfo, created } = await Purchases.logIn(userId);
    console.log(`[RevenueCat] User logged in: ${created ? 'New user' : 'Existing user'}`);
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Login failed:', error);
    throw error;
  }
};

// Get current customer info
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Error getting customer info:', error);
    return null;
  }
};

// Check if user has Away Premium entitlement
export const checkAwayPremiumEntitlement = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const hasEntitlement = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
    return hasEntitlement;
  } catch (error) {
    console.error('[RevenueCat] Error checking entitlement:', error);
    return false;
  }
};

// Get available offerings (products)
export const getOfferings = async (): Promise<PurchasesOfferings | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('[RevenueCat] Error fetching offerings:', error);
    return null;
  }
};

// Purchase a package
export const purchasePackage = async (
  packageToPurchase: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    // Check if the entitlement is now active
    const isAwayPremium = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
    
    if (isAwayPremium) {
      console.log('[RevenueCat] Purchase successful - Away Premium activated');
      return { success: true, customerInfo };
    } else {
      return { success: false, error: 'Purchase completed but entitlement not found' };
    }
  } catch (error) {
    const purchaseError = error as PurchasesError;
    
    // Handle user cancellation gracefully
    if (purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      console.log('[RevenueCat] User cancelled purchase');
      return { success: false, error: 'cancelled' };
    }
    
    console.error('[RevenueCat] Purchase error:', purchaseError);
    return { success: false, error: handlePurchaseError(purchaseError) };
  }
};

// Restore purchases
export const restorePurchases = async (): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
  try {
    // Note: restorePurchases doesn't work on web
    if (Platform.OS === 'web') {
      return { success: false, error: 'Restore not available on web' };
    }
    
    const customerInfo = await Purchases.restorePurchases();
    const isAwayPremium = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
    
    return { 
      success: isAwayPremium, 
      customerInfo,
      error: isAwayPremium ? undefined : 'No active subscriptions found'
    };
  } catch (error) {
    console.error('[RevenueCat] Restore error:', error);
    return { success: false, error: 'Failed to restore purchases' };
  }
};

// Handle purchase errors with user-friendly messages
export const handlePurchaseError = (error: PurchasesError): string => {
  switch (error.code) {
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
      return 'Purchases are not allowed on this device. Please check your device settings.';
    case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
      return 'The purchase could not be completed. Please verify your payment method.';
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again.';
    case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
      return 'This product is not available for purchase.';
    case PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR:
      return 'This receipt is already associated with another account.';
    case PURCHASES_ERROR_CODE.INVALID_RECEIPT_ERROR:
      return 'Invalid receipt. Please try again.';
    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return 'Payment is pending. Please complete the payment process.';
    default:
      return 'An error occurred during purchase. Please try again later.';
  }
};

// Add listener for customer info updates
export const addCustomerInfoUpdateListener = (
  callback: (customerInfo: CustomerInfo) => void
): (() => void) => {
  const listener = Purchases.addCustomerInfoUpdateListener(callback);
  return () => {
    // Return cleanup function
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
};

// Get subscription management URL (for Customer Center)
export const getManagementURL = async (): Promise<string | null> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo?.managementURL || null;
  } catch (error) {
    console.error('[RevenueCat] Error getting management URL:', error);
    return null;
  }
};

// Sync purchases (useful after app restore or reinstall)
export const syncPurchases = async (): Promise<void> => {
  try {
    await Purchases.syncPurchases();
    console.log('[RevenueCat] Purchases synced');
  } catch (error) {
    console.error('[RevenueCat] Error syncing purchases:', error);
  }
};
