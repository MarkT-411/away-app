import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export type MembershipPlan = 'free' | 'monthly' | 'annual';
export type MembershipStatus = 'active' | 'paused' | 'expired' | 'none';

export interface MembershipInfo {
  plan: MembershipPlan;
  status: MembershipStatus;
  startDate?: string;
  expiryDate?: string;
  pausedUntil?: string;
  pausedMonthsUsed: number; // Max 3 months per year
  isMember: boolean;
}

interface MembershipContextType {
  membership: MembershipInfo;
  isMember: boolean;
  canAccessFeature: (feature: FeatureType) => boolean;
  showUpgradePrompt: (feature: string) => void;
  subscribe: (plan: 'monthly' | 'annual') => Promise<boolean>;
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
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadMembership();
    } else {
      setMembership(defaultMembership);
    }
  }, [user?.id]);

  const loadMembership = async () => {
    try {
      // Try to load from server first
      if (user?.id) {
        const res = await fetch(`${API_URL}/api/membership/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
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
    }
  };

  const refreshMembership = async () => {
    await loadMembership();
  };

  const isMember = membership.plan !== 'free' && membership.status === 'active';

  const canAccessFeature = (feature: FeatureType): boolean => {
    // Free features are always accessible
    if (FEATURE_ACCESS[feature]) {
      return true;
    }
    // Member-only features require active membership
    return isMember;
  };

  const showUpgradePrompt = (feature: string) => {
    Alert.alert(
      '🔒 Member Feature',
      `"${feature}" is available for TAM Members.\n\nUnlock all premium features:\n• AI Trip Planner\n• SOS & Safety\n• Rides/Trips\n• Full Track Access\n\nStarting at €3.99/month`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'View Plans', onPress: () => {
          // Navigate to subscription screen
          // router.push('/subscription');
        }},
      ]
    );
  };

  const subscribe = async (plan: 'monthly' | 'annual'): Promise<boolean> => {
    try {
      // In production, integrate with App Store / Google Play
      // For now, simulate subscription
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

      // Save to server
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

      // Save locally
      await AsyncStorage.setItem('membership', JSON.stringify(newMembership));
      setMembership(newMembership);

      Alert.alert('🎉 Welcome!', `You are now a TAM Member!\n\nYour ${plan} subscription is active.`);
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

      // Save to server
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
      canAccessFeature,
      showUpgradePrompt,
      subscribe,
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
