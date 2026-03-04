import React from 'react';
import { View, Image, StyleSheet, useColorScheme } from 'react-native';

interface HelmetLogoProps {
  size?: number;
  showBackground?: boolean;
  forceTheme?: 'light' | 'dark';  // Force a specific theme
}

export default function HelmetLogo({ size = 100, showBackground = true, forceTheme }: HelmetLogoProps) {
  // Use system color scheme
  const systemColorScheme = useColorScheme();
  
  // Determine which theme to use
  const effectiveTheme = forceTheme || systemColorScheme || 'dark';
  const isDark = effectiveTheme === 'dark';
  
  // Determine background color based on theme
  const backgroundColor = showBackground 
    ? (isDark ? '#1A1A1A' : '#F5F5F5')
    : 'transparent';
  
  // Add subtle shadow for light mode
  const shadowStyle = !isDark && showBackground ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } : {};
  
  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size, 
        backgroundColor,
        borderRadius: size / 2,
      },
      shadowStyle
    ]}>
      <Image
        source={require('../assets/images/helmet-logo.png')}
        style={[styles.logo, { width: size * 0.85, height: size * 0.85 }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    // The image already has the correct colors
  },
});
