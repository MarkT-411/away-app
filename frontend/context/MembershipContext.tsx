import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { useAuth } from './AuthContext';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import * as RevenueCatService from '../services/revenueCatService';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';
const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || 'away_premium';

export type MembershipPlan = 'free' | 'monthly' | 'annual';
export type MembershipStatus = 'active' | 'paused' | 'expired' | 'none';

export interface MembershipInfo {
  plan: MembershipPlan;
  status: MembershipStatus;
  startDate?: string;
  expiryDate?: string;
  pausedUntil?: string;
  pausedMonthsUsed: number;
  isMember: boolean;
}

interface MembershipContextType {
  membership: MembershipInfo;
  isMember: boolean;
  isLoading: boolean;
  offerings: any;
  canAccessFeature: (feature: FeatureType) => boolean;
  showUpgradePrompt: (feature: string) => void;
  subscribe: (plan: 'monthly' | 'annual') => Promise<boolean>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  pauseMembership: (months: number) => Promise<boolean>;
  resumeMembership: () => Promise<boolean>;
  refreshMembership: () => Promise<void>;
}

export type FeatureType = 
  | 'feed' 
  | 'events' 
  | 'rides' 
  | 'tracks_view' 
  | 'tracks_full' 
  | 'market' 
  | 'trip_planner' 
  | 'sos'
  | 'garage';

// Feature access matrix
const FEATURE_ACCESS: Record<FeatureType, boolean> = {
  feed: true,           // Free
  events: true,         // Free
  rides: false,         // Member only
  tracks_view: true,    // Free (view only)
  tracks_full: false,   // Member only (download, upload, etc.)
  market: true,         // Free
  trip_planner: false,  // Member only
  sos: false,           // Member only
  garage: true,         // Free (basic)
};

const MEMBERSHIP_PRICES = {
  monthly: 3.99,
  annual: 39.99,
};

const defaultMembership: MembershipInfo = {
  plan: 'free',
  status: 'none',
  pausedMonthsUsed: 0,
  isMember: false,
};

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [membership, setMembership] = useState<MembershipInfo>(defaultMembership);
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<any>(null);
  const [revenueCatInitialized, setRevenueCatInitialized] = useState(false);
  const { user } = useAuth();

  // Initialize RevenueCat
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  // Load membership when user changes
  useEffect(() => {
    if (user?.id && revenueCatInitialized) {
      loadMembership();
      loginToRevenueCat(user.id);
    } else if (!user) {
      setMembership(defaultMembership);
    }
  }, [user?.id, revenueCatInitialized]);

  const initializeRevenueCat = async () => {
    try {
      if (!REVENUECAT_API_KEY) {
        console.log('[RevenueCat] No API key configured, using mock mode');
        setRevenueCatInitialized(true);
        setIsLoading(false);
        return;
      }

      await RevenueCatService.initializeRevenueCat();
      setRevenueCatInitialized(true);
      
      // Load offerings
      const offers = await RevenueCatService.getOfferings();
      setOfferings(offers);
      
      // Add listener for customer info updates
      const removeListener = RevenueCatService.addCustomerInfoUpdateListener((customerInfo) => {
        updateMembershipFromCustomerInfo(customerInfo);
      });

      setIsLoading(false);
      return removeListener;
    } catch (error) {
      console.error('[MembershipContext] RevenueCat init error:', error);
      setRevenueCatInitialized(true);
      setIsLoading(false);
    }
  };

  const loginToRevenueCat = async (userId: string) => {
    try {
      const customerInfo = await RevenueCatService.loginUser(userId);
      updateMembershipFromCustomerInfo(customerInfo);
    } catch (error) {
      console.error('[MembershipContext] RevenueCat login error:', error);
    }
  };

  const updateMembershipFromCustomerInfo = (customerInfo: CustomerInfo) => {
    const hasEntitlement = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
    const entitlement = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
    
    if (hasEntitlement && entitlement) {
      const newMembership: MembershipInfo = {
        plan: entitlement.productIdentifier?.includes('yearly') ? 'annual' : 'monthly',
        status: 'active',
        startDate: entitlement.originalPurchaseDate,
        expiryDate: entitlement.expirationDate || undefined,
        pausedMonthsUsed: membership.pausedMonthsUsed,
        isMember: true,
      };
      setMembership(newMembership);
    } else {
      setMembership(defaultMembership);
    }
  };

  const loadMembership = async () => {
    try {
      setIsLoading(true);
      
      // First check RevenueCat
      if (revenueCatInitialized && REVENUECAT_API_KEY) {
        const customerInfo = await RevenueCatService.getCustomerInfo();
        if (customerInfo) {
          updateMembershipFromCustomerInfo(customerInfo);
          setIsLoading(false);
          return;
        }
      }
      
      // Fallback to server
      if (user?.id) {
        const res = await fetch(`${API_URL}/api/membership/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.plan !== 'free') {
            const membershipData: MembershipInfo = {
              plan: data.plan || 'free',
              status: data.status || 'none',
              startDate: data.start_date,
              expiryDate: data.expiry_date,
              pausedUntil: data.paused_until,
              pausedMonthsUsed: data.paused_months_used || 0,
              isMember: data.plan !== 'free' && data.status === 'active',
            };
            setMembership(membershipData);
            setIsLoading(false);
            return;
          }
        }
      }
      
      // Fallback to local storage
      const stored = await AsyncStorage.getItem('membership');
      if (stored) {
        setMembership(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading membership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMembership = async () => {
    await loadMembership();
  };

  const isMember = membership.plan !== 'free' && membership.status === 'active';

  const canAccessFeature = (feature: FeatureType): boolean => {
    if (FEATURE_ACCESS[feature]) {
      return true;
    }
    return isMember;
  };

  const showUpgradePrompt = (feature: string) => {
    Alert.alert(
      '🔒 Member Feature',
      `"${feature}" is available for AWay Members.\n\nUnlock all premium features:\n• AI Trip Planner\n• SOS & Safety\n• Rides/Trips\n• Full Track Access\n\nStarting at €3.99/month`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'View Plans', onPress: () => {
          // Will be handled by subscription screen
        }},
      ]
    );
  };

  // Purchase via RevenueCat package
  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await RevenueCatService.purchasePackage(pkg);
      
      if (result.success && result.customerInfo) {
        updateMembershipFromCustomerInfo(result.customerInfo);
        
        // Also save to backend
        if (user?.id) {
          const plan = pkg.identifier.includes('yearly') ? 'annual' : 'monthly';
          await fetch(`${API_URL}/api/membership`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              plan,
              status: 'active',
              start_date: new Date().toISOString(),
              revenuecat_customer_id: result.customerInfo.originalAppUserId,
            }),
          });
        }
        
        Alert.alert('🎉 Welcome!', 'You are now an AWay Premium Member!');
        return true;
      } else if (result.error === 'cancelled') {
        // User cancelled - don't show error
        return false;
      } else {
        Alert.alert('Purchase Failed', result.error || 'An error occurred');
        return false;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Failed to process purchase');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Restore purchases
  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await RevenueCatService.restorePurchases();
      
      if (result.success && result.customerInfo) {
        updateMembershipFromCustomerInfo(result.customerInfo);
        Alert.alert('Success', 'Your purchases have been restored!');
        return true;
      } else {
        Alert.alert('No Purchases Found', result.error || 'No active subscriptions found to restore.');
        return false;
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy subscribe method (for mock/fallback)
  const subscribe = async (plan: 'monthly' | 'annual'): Promise<boolean> => {
    try {
      // Try to find the package in offerings
      if (offerings?.current?.availablePackages) {
        const packageId = plan === 'annual' ? 'yearly' : 'monthly';
        const pkg = offerings.current.availablePackages.find(
          (p: PurchasesPackage) => p.identifier.toLowerCase().includes(packageId)
        );
        
        if (pkg) {
          return await purchasePackage(pkg);
        }
      }
      
      // Fallback to mock subscription
      const now = new Date();
      const expiryDate = new Date(now);
      
      if (plan === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      const newMembership: MembershipInfo = {
        plan,
        status: 'active',
        startDate: now.toISOString(),
        expiryDate: expiryDate.toISOString(),
        pausedMonthsUsed: 0,
        isMember: true,
      };

      if (user?.id) {
        await fetch(`${API_URL}/api/membership`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            plan,
            status: 'active',
            start_date: now.toISOString(),
            expiry_date: expiryDate.toISOString(),
            paused_months_used: 0,
          }),
        });
      }

      await AsyncStorage.setItem('membership', JSON.stringify(newMembership));
      setMembership(newMembership);

      Alert.alert('🎉 Welcome!', `You are now an AWay Member!\n\nYour ${plan} subscription is active.`);
      return true;
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'Failed to process subscription');
      return false;
    }
  };

  const pauseMembership = async (months: number): Promise<boolean> => {
    if (membership.pausedMonthsUsed + months > 3) {
      Alert.alert('Limit Reached', 'You can only pause your membership for a maximum of 3 months per year.');
      return false;
    }

    try {
      const pausedUntil = new Date();
      pausedUntil.setMonth(pausedUntil.getMonth() + months);

      const updatedMembership: MembershipInfo = {
        ...membership,
        status: 'paused',
        pausedUntil: pausedUntil.toISOString(),
        pausedMonthsUsed: membership.pausedMonthsUsed + months,
        isMember: false,
      };

      if (user?.id) {
        await fetch(`${API_URL}/api/membership/${user.id}/pause`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ months }),
        });
      }

      await AsyncStorage.setItem('membership', JSON.stringify(updatedMembership));
      setMembership(updatedMembership);

      Alert.alert('Membership Paused', `Your membership is paused until ${pausedUntil.toLocaleDateString()}`);
      return true;
    } catch (error) {
      console.error('Pause error:', error);
      return false;
    }
  };

  const resumeMembership = async (): Promise<boolean> => {
    try {
      const updatedMembership: MembershipInfo = {
        ...membership,
        status: 'active',
        pausedUntil: undefined,
        isMember: true,
      };

      if (user?.id) {
        await fetch(`${API_URL}/api/membership/${user.id}/resume`, {
          method: 'PUT',
        });
      }

      await AsyncStorage.setItem('membership', JSON.stringify(updatedMembership));
      setMembership(updatedMembership);

      Alert.alert('Welcome Back!', 'Your membership is now active again.');
      return true;
    } catch (error) {
      console.error('Resume error:', error);
      return false;
    }
  };

  return (
    <MembershipContext.Provider value={{
      membership,
      isMember,
      isLoading,
      offerings,
      canAccessFeature,
      showUpgradePrompt,
      subscribe,
      purchasePackage,
      restorePurchases,
      pauseMembership,
      resumeMembership,
      refreshMembership,
    }}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (context === undefined) {
    throw new Error('useMembership must be used within a MembershipProvider');
  }
  return context;
}
