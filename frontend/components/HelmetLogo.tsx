import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface HelmetLogoProps {
  size?: number;
  color?: string;
}

export default function HelmetLogo({ size = 80, color = '#FF6B35' }: HelmetLogoProps) {
  const strokeWidth = size * 0.035;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G 
        stroke={color} 
        strokeWidth={strokeWidth} 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* Main helmet shell - smooth rounded curve */}
        <Path d="
          M 75 35
          C 80 45, 82 55, 80 65
          C 78 75, 70 82, 58 85
          C 45 88, 32 85, 25 78
          C 20 73, 18 65, 20 55
          C 22 45, 30 35, 45 28
          C 55 23, 68 25, 75 35
        "/>
        
        {/* Visor peak - sharp triangular pointing forward-up at ~18 degrees */}
        <Path d="
          M 30 42
          L 12 35
          L 14 42
          L 28 48
        "/>
        
        {/* Eye port - elongated horizontal opening */}
        <Path d="
          M 28 48
          C 35 42, 50 40, 65 44
          C 72 46, 76 50, 78 55
        "/>
        
        {/* Eye port bottom edge */}
        <Path d="
          M 25 58
          C 35 54, 52 52, 68 55
          C 74 56, 78 60, 80 65
        "/>
        
        {/* Chin bar outer curve */}
        <Path d="
          M 20 55
          C 18 62, 18 70, 22 76
          C 26 82, 35 85, 45 85
        "/>
        
        {/* Horizontal vent slits on chin bar - 4 lines */}
        <Path d="M 22 62 L 35 60"/>
        <Path d="M 23 67 L 38 65"/>
        <Path d="M 24 72 L 40 70"/>
        <Path d="M 26 77 L 42 75"/>
        
        {/* Top of helmet contour */}
        <Path d="
          M 45 28
          C 55 25, 68 28, 75 35
        "/>
      </G>
    </Svg>
  );
}
