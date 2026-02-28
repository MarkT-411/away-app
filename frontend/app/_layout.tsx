import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { CountryProvider, useCountry } from '../context/CountryContext';
import { MotoTypesProvider, useMotoTypes } from '../context/MotoTypesContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AuthScreen from '../components/AuthScreen';

function AppContent() {
  const { isOnboarded, setIsOnboarded, setSelectedCountry, loading: countryLoading } = useCountry();
  const { setSelectedMotoTypes, loading: motoTypesLoading } = useMotoTypes();
  const { isAuthenticated, isGuest, isLoading: authLoading, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const loading = countryLoading || motoTypesLoading || authLoading;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
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
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0D0D0D' },
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
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CountryProvider>
        <MotoTypesProvider>
          <StatusBar style="light" />
          <AppContent />
        </MotoTypesProvider>
      </CountryProvider>
    </AuthProvider>
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
