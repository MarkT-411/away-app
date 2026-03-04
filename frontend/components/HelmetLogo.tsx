import React from 'react';
import { View, Image, StyleSheet, useColorScheme } from 'react-native';

interface HelmetLogoProps {
  size?: number;
  showBackground?: boolean;
  forceDark?: boolean;
}

export default function HelmetLogo({ size = 100, showBackground = true, forceDark = false }: HelmetLogoProps) {
  // Use system color scheme as fallback when ThemeContext is not available
  const systemColorScheme = useColorScheme();
  
  // Determine if we should use dark mode
  const isDark = forceDark || systemColorScheme === 'dark';
  
  // Determine background color based on theme
  const backgroundColor = showBackground 
    ? (isDark ? '#1A1A1A' : '#FFFFFF')
    : 'transparent';
  
  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size, 
        backgroundColor,
        borderRadius: size / 2,
      }
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
