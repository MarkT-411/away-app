import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface HelmetLogoProps {
  size?: number;
}

export default function HelmetLogo({ size = 100 }: HelmetLogoProps) {
  return (
    <Image
      source={require('../assets/images/helmet-logo.png')}
      style={[styles.logo, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    // The image already has the correct colors
  },
});
