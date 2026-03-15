import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { CountryProvider, useCountry } from '../context/CountryContext';
import { MotoTypesProvider, useMotoTypes } from '../context/MotoTypesContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { MembershipProvider } from '../context/MembershipContext';
import AuthScreen from '../components/AuthScreen';

function AppContent() {
  const { isOnboarded, setIsOnboarded, setSelectedCountry, loading: countryLoading } = useCountry();
  const { setSelectedMotoTypes, loading: motoTypesLoading } = useMotoTypes();
  const { isAuthenticated, isGuest, isLoading: authLoading, logout } = useAuth();
  const { loading: languageLoading } = useLanguage();
  const { colors, isDark } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Rostex': require('../assets/fonts/Rostex-Regular.ttf'),
        'Rostex-Outline': require('../assets/fonts/Rostex-Outline.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  const loading = countryLoading || motoTypesLoading || authLoading || languageLoading || !fontsLoaded;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // If not authenticated and not guest, show auth screen
  if (!isAuthenticated && !isGuest) {
    return (
      <AuthScreen
        onComplete={() => {
          setIsOnboarded(true);
        }}
        onSkip={() => {
          setIsOnboarded(true);
        }}
      />
    );
  }

  // If user wants to login/register from within app
  if (showAuth) {
    return (
      <AuthScreen
        onComplete={() => {
          setShowAuth(false);
        }}
        onSkip={() => {
          setShowAuth(false);
        }}
      />
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="event-details" options={{ headerShown: false }} />
        <Stack.Screen name="trip-details" options={{ headerShown: false }} />
        <Stack.Screen name="market-details" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="create-post" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="create-event" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="create-trip" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="create-listing" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="create-track" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="garage" options={{ headerShown: false }} />
        <Stack.Screen name="add-vehicle" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="sos" options={{ headerShown: false }} />
        <Stack.Screen name="sos-contacts" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="trip-planner" options={{ headerShown: false }} />
        <Stack.Screen name="subscription" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <CountryProvider>
            <MotoTypesProvider>
              <AppContent />
            </MotoTypesProvider>
          </CountryProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
