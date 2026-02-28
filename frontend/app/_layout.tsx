import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { CountryProvider, useCountry } from '../context/CountryContext';
import { MotoTypesProvider, useMotoTypes } from '../context/MotoTypesContext';
import WelcomeScreen from '../components/WelcomeScreen';

function AppContent() {
  const { isOnboarded, setIsOnboarded, setSelectedCountry, loading: countryLoading } = useCountry();
  const { setSelectedMotoTypes, loading: motoTypesLoading } = useMotoTypes();

  const loading = countryLoading || motoTypesLoading;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!isOnboarded) {
    return (
      <WelcomeScreen
        onComplete={(country, motoTypes) => {
          setSelectedCountry(country);
          setSelectedMotoTypes(motoTypes);
          setIsOnboarded(true);
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
    <CountryProvider>
      <MotoTypesProvider>
        <StatusBar style="light" />
        <AppContent />
      </MotoTypesProvider>
    </CountryProvider>
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
