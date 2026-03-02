import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface HelmetLogoProps {
  size?: number;
  color?: string;
}

export default function HelmetLogo({ size = 80, color = '#FF6B35' }: HelmetLogoProps) {
  const strokeWidth = size * 0.026;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G 
        stroke={color} 
        strokeWidth={strokeWidth} 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* Outer helmet shell - smooth oval shape */}
        <Path d="
          M 70 38
          C 76 48, 76 60, 72 70
          C 68 78, 58 84, 46 84
          C 34 84, 24 78, 20 68
          C 16 58, 18 46, 24 38
          C 32 28, 46 24, 58 26
          C 66 28, 70 32, 70 38
        "/>
        
        {/* Visor peak - sharp angular extension */}
        <Path d="
          M 26 40
          L 8 30
          L 12 40
          L 24 48
        "/>
        
        {/* Eye port top curve */}
        <Path d="
          M 24 48
          C 34 42, 50 40, 64 46
          C 70 48, 74 54, 74 60
        "/>
        
        {/* Eye port bottom curve */}
        <Path d="
          M 22 56
          C 34 50, 52 48, 66 54
          C 72 56, 76 62, 76 68
        "/>
        
        {/* Chin bar */}
        <Path d="
          M 24 38
          C 18 46, 16 58, 18 68
          C 20 76, 28 82, 40 84
        "/>
        
        {/* Horizontal chin vents */}
        <Path d="M 20 52 L 36 48"/>
        <Path d="M 19 60 L 40 56"/>
        <Path d="M 20 68 L 42 64"/>
        <Path d="M 24 76 L 44 72"/>
      </G>
    </Svg>
  );
}
