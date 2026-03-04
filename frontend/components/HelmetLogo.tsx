import React from 'react';
import { View, Image, StyleSheet, useColorScheme } from 'react-native';

interface HelmetLogoProps {
  size?: number;
  forceTheme?: 'light' | 'dark';
}

export default function HelmetLogo({ size = 100, forceTheme }: HelmetLogoProps) {
  // Use system color scheme
  const systemColorScheme = useColorScheme();
  
  // Determine which theme to use
  const effectiveTheme = forceTheme || systemColorScheme || 'dark';
  const isDark = effectiveTheme === 'dark';
  
  // Background color based on theme
  const backgroundColor = isDark ? '#1A1A1A' : '#F5F5F5';
  
  // Orange border color (same as helmet/accent)
  const borderColor = '#FF6B35';
  
  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size, 
        backgroundColor,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: borderColor,
      }
    ]}>
      <Image
        source={require('../assets/images/helmet-logo.png')}
        style={[styles.logo, { width: size * 0.8, height: size * 0.8 }]}
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
