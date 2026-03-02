import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface HelmetLogoProps {
  size?: number;
  color?: string;
}

export default function HelmetLogo({ size = 80, color = '#FF6B35' }: HelmetLogoProps) {
  const strokeWidth = size * 0.03;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G 
        stroke={color} 
        strokeWidth={strokeWidth} 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* Main helmet shell - profile facing left */}
        <Path d="
          M 70 30
          C 78 38, 82 50, 80 62
          C 78 74, 68 82, 55 85
          C 42 88, 30 84, 24 76
          C 20 70, 18 60, 22 50
        "/>
        
        {/* Top curve of helmet */}
        <Path d="
          M 22 50
          C 26 38, 38 28, 55 25
          C 62 24, 68 26, 70 30
        "/>
        
        {/* Visor peak - prominent sharp angle extending forward */}
        <Path d="
          M 28 44
          L 8 36
          L 10 44
          L 26 52
        "/>
        
        {/* Eye port top curve */}
        <Path d="
          M 26 52
          C 34 44, 50 40, 66 45
          C 74 48, 78 54, 80 62
        "/>
        
        {/* Eye port bottom */}
        <Path d="
          M 24 60
          C 34 55, 52 52, 68 56
          C 76 58, 80 64, 80 70
        "/>
        
        {/* Chin bar with vents */}
        <Path d="
          M 22 50
          C 18 58, 18 68, 22 76
          C 26 82, 36 86, 48 86
        "/>
        
        {/* Vent lines on chin - horizontal slits */}
        <Path d="M 20 58 L 34 55"/>
        <Path d="M 20 64 L 38 61"/>
        <Path d="M 21 70 L 40 67"/>
        <Path d="M 23 76 L 42 73"/>
      </G>
    </Svg>
  );
}
