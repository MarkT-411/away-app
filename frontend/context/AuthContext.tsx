import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  country?: string;
  moto_types: string[];
  biometric_enabled: boolean;
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricAvailable: boolean;
  biometricType: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  authenticateWithBiometric: () => Promise<{ success: boolean; message: string }>;
  enableBiometric: () => Promise<{ success: boolean; message: string }>;
  updateUserAvatar: (avatar: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  country?: string;
  moto_types?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: '@moto_app_user',
  IS_GUEST: '@moto_app_is_guest',
  BIOMETRIC_USER_ID: 'moto_app_biometric_user_id',
};

// DEV MODE: Set to true to bypass login screen
const DEV_BYPASS_AUTH = false;

const DEV_USER: User = {
  id: 'dev-user-1',
  email: 'dev@test.com',
  username: 'DevTester',
  avatar: undefined,
  bio: 'Developer test account',
  country: 'IT',
  moto_types: ['sport', 'adventure'],
  biometric_enabled: false,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);

  useEffect(() => {
    checkBiometricAvailability();
    loadStoredAuth();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (compatible && enrolled) {
        setBiometricAvailable(true);
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        }
      }
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const loadStoredAuth = async () => {
    try {
      // DEV MODE: Auto-login with dev user
      if (DEV_BYPASS_AUTH) {
        setUser(DEV_USER);
        setIsGuest(false);
        setIsLoading(false);
        return;
      }

      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const storedIsGuest = await AsyncStorage.getItem(STORAGE_KEYS.IS_GUEST);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (storedIsGuest === 'true') {
        setIsGuest(true);
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Fetch full user data
        const userResponse = await fetch(`${API_URL}/api/auth/user/${data.user_id}`);
        const userData = await userResponse.json();
        
        setUser(userData);
        setIsGuest(false);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        await AsyncStorage.removeItem(STORAGE_KEYS.IS_GUEST);
        
        // Store user ID for biometric login if available
        if (Platform.OS !== 'web') {
          try {
            await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_USER_ID, data.user_id);
          } catch (e) {
            // SecureStore not available on web
          }
        }
        
        return { success: true, message: 'Login successful' };
      }

      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Connection error. Please try again.' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Fetch full user data
        const userResponse = await fetch(`${API_URL}/api/auth/user/${result.user_id}`);
        const userData = await userResponse.json();
        
        setUser(userData);
        setIsGuest(false);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        await AsyncStorage.removeItem(STORAGE_KEYS.IS_GUEST);
        
        // Store user ID for biometric login
        if (Platform.OS !== 'web') {
          try {
            await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_USER_ID, result.user_id);
          } catch (e) {
            // SecureStore not available on web
          }
        }
        
        return { success: true, message: 'Registration successful' };
      }

      return { success: false, message: result.message || 'Registration failed' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Connection error. Please try again.' };
    }
  };

  const logout = async () => {
    setUser(null);
    setIsGuest(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.IS_GUEST);
    if (Platform.OS !== 'web') {
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_USER_ID);
      } catch (e) {
        // SecureStore not available on web
      }
    }
  };

  const continueAsGuest = async () => {
    setIsGuest(true);
    setUser(null);
    await AsyncStorage.setItem(STORAGE_KEYS.IS_GUEST, 'true');
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  };

  const authenticateWithBiometric = async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (!biometricAvailable) {
        return { success: false, message: 'Biometric authentication not available' };
      }

      // Get stored user ID
      let storedUserId: string | null = null;
      if (Platform.OS !== 'web') {
        try {
          storedUserId = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_USER_ID);
        } catch (e) {
          // SecureStore not available on web
        }
      }
      
      if (!storedUserId) {
        return { success: false, message: 'No account linked to biometric. Please login with password first.' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Login with ${biometricType || 'Biometric'}`,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Fetch user data
        const userResponse = await fetch(`${API_URL}/api/auth/user/${storedUserId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setIsGuest(false);
          await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
          return { success: true, message: 'Authentication successful' };
        }
        return { success: false, message: 'User not found. Please login with password.' };
      }

      return { success: false, message: 'Biometric authentication failed' };
    } catch (error) {
      console.error('Biometric auth error:', error);
      return { success: false, message: 'Authentication error' };
    }
  };

  const enableBiometric = async (): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Please login first' };
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/enable-biometric/${user.id}`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedUser = { ...user, biometric_enabled: true };
        setUser(updatedUser);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        return { success: true, message: 'Biometric enabled' };
      }
      return { success: false, message: 'Failed to enable biometric' };
    } catch (error) {
      return { success: false, message: 'Connection error' };
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        isAuthenticated,
        isLoading,
        biometricAvailable,
        biometricType,
        login,
        register,
        logout,
        continueAsGuest,
        authenticateWithBiometric,
        enableBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
