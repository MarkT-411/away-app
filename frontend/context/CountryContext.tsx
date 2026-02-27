import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CountryContextType {
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
  loading: boolean;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

const STORAGE_KEY_COUNTRY = '@moto_app_country';
const STORAGE_KEY_ONBOARDED = '@moto_app_onboarded';

export const COUNTRIES = [
  { code: 'all', name: 'Worldwide', flag: '🌍' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
];

export function CountryProvider({ children }: { children: ReactNode }) {
  const [selectedCountry, setSelectedCountryState] = useState<string>('all');
  const [isOnboarded, setIsOnboardedState] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedPreferences();
  }, []);

  const loadSavedPreferences = async () => {
    try {
      const [savedCountry, savedOnboarded] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_COUNTRY),
        AsyncStorage.getItem(STORAGE_KEY_ONBOARDED),
      ]);
      
      if (savedCountry) {
        setSelectedCountryState(savedCountry);
      }
      if (savedOnboarded === 'true') {
        setIsOnboardedState(true);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const setSelectedCountry = async (country: string) => {
    setSelectedCountryState(country);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_COUNTRY, country);
    } catch (error) {
      console.error('Error saving country:', error);
    }
  };

  const setIsOnboarded = async (value: boolean) => {
    setIsOnboardedState(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ONBOARDED, value.toString());
    } catch (error) {
      console.error('Error saving onboarded status:', error);
    }
  };

  return (
    <CountryContext.Provider
      value={{
        selectedCountry,
        setSelectedCountry,
        isOnboarded,
        setIsOnboarded,
        loading,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}

export function getCountryName(code: string): string {
  const country = COUNTRIES.find(c => c.code === code);
  return country ? country.name : 'Worldwide';
}

export function getCountryFlag(code: string): string {
  const country = COUNTRIES.find(c => c.code === code);
  return country ? country.flag : '🌍';
}
