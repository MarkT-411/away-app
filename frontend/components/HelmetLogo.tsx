import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface HelmetLogoProps {
  size?: number;
  color?: string;
}

export default function HelmetLogo({ size = 80, color = '#FF6B35' }: HelmetLogoProps) {
  const strokeWidth = size * 0.028;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G 
        stroke={color} 
        strokeWidth={strokeWidth} 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* Main helmet shell outline - clean rounded profile */}
        <Path d="
          M 72 40
          Q 78 50, 76 62
          Q 74 74, 62 80
          Q 48 86, 34 82
          Q 24 78, 20 68
          Q 16 58, 20 48
          Q 24 36, 40 28
          Q 56 22, 68 28
          Q 74 32, 72 40
        "/>
        
        {/* Sharp visor/peak - triangular pointing forward-up */}
        <Path d="
          M 24 42
          L 6 32
          L 10 42
          L 22 50
        "/>
        
        {/* Eye port / visor opening - smooth curves */}
        <Path d="
          M 22 50
          Q 36 42, 54 44
          Q 68 46, 74 54
        "/>
        
        <Path d="
          M 20 58
          Q 38 52, 56 54
          Q 70 56, 76 64
        "/>
        
        {/* Chin guard curve */}
        <Path d="
          M 20 48
          Q 16 58, 18 68
          Q 20 78, 32 82
        "/>
        
        {/* Chin vent lines - 4 horizontal slits */}
        <Path d="M 18 56 L 32 53"/>
        <Path d="M 18 62 L 36 59"/>
        <Path d="M 19 68 L 38 65"/>
        <Path d="M 22 74 L 40 71"/>
      </G>
    </Svg>
  );
}
