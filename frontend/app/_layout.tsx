import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
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
        <Stack.Screen name="create-post" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="create-event" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="create-trip" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="create-listing" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </>
  );
}
