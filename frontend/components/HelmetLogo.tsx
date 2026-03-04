import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface HelmetLogoProps {
  size?: number;
  showBackground?: boolean;
}

export default function HelmetLogo({ size = 100, showBackground = true }: HelmetLogoProps) {
  const { colors, theme } = useTheme();
  
  // Determine background color based on theme
  const backgroundColor = showBackground 
    ? (theme === 'dark' ? '#1A1A1A' : '#FFFFFF')
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
