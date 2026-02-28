import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { setLocale } from '../i18n';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
];

interface LanguageContextType {
  selectedLanguage: string;
  setSelectedLanguage: (code: string) => Promise<void>;
  getLanguage: () => Language;
  loading: boolean;
  t: (key: string, options?: object) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = '@moto_app_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [selectedLanguage, setSelectedLanguageState] = useState<string>('en');
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0); // Force re-render on language change

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSelectedLanguageState(saved);
        setLocale(saved);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setLoading(false);
    }
  };

  const setSelectedLanguage = async (code: string) => {
    setSelectedLanguageState(code);
    setLocale(code);
    forceUpdate(n => n + 1); // Force re-render to update translations
    try {
      await AsyncStorage.setItem(STORAGE_KEY, code);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const getLanguage = (): Language => {
    return LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];
  };

  // Translation function that uses current locale
  const t = useCallback((key: string, options?: object): string => {
    return i18n.t(key, options);
  }, [selectedLanguage]); // Re-create when language changes

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage,
        getLanguage,
        loading,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function getLanguageByCode(code: string): Language {
  return LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
}
