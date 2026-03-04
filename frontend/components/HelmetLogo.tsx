import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Path, Circle, Ellipse, G } from 'react-native-svg';

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
  
  // Colors based on theme
  const helmetColor = '#FF6B35'; // Orange accent
  const visorColor = isDark ? '#333333' : '#222222';
  const highlightColor = isDark ? '#FF8B55' : '#FF7B45';
  const shadowColor = isDark ? '#CC4A15' : '#CC4A15';
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Helmet Base */}
        <Ellipse
          cx="50"
          cy="55"
          rx="38"
          ry="35"
          fill={helmetColor}
        />
        
        {/* Helmet Top Curve */}
        <Path
          d="M15 50 Q15 20 50 15 Q85 20 85 50"
          fill={helmetColor}
        />
        
        {/* Helmet Highlight */}
        <Path
          d="M25 45 Q25 25 50 22 Q70 25 72 40"
          fill={highlightColor}
          opacity={0.6}
        />
        
        {/* Visor */}
        <Path
          d="M20 52 Q20 42 50 40 Q80 42 80 52 L78 60 Q50 58 22 60 Z"
          fill={visorColor}
        />
        
        {/* Visor Reflection */}
        <Path
          d="M25 50 Q30 45 50 44 Q65 45 70 48"
          stroke={isDark ? '#555' : '#444'}
          strokeWidth="1.5"
          fill="none"
          opacity={0.5}
        />
        
        {/* Bottom Shadow */}
        <Ellipse
          cx="50"
          cy="85"
          rx="30"
          ry="5"
          fill={shadowColor}
          opacity={0.3}
        />
        
        {/* Chin Guard */}
        <Path
          d="M25 65 Q25 80 50 82 Q75 80 75 65"
          fill={shadowColor}
          opacity={0.4}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
