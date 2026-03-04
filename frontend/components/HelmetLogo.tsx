import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface HelmetLogoProps {
  size?: number;
}

export default function HelmetLogo({ size = 100 }: HelmetLogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require('../assets/images/helmet-logo.png')}
        style={[styles.logo, { width: size, height: size }]}
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
    borderRadius: 8,
  },
});
