import React from 'react';
import Svg, { Path, G, Circle } from 'react-native-svg';

interface HelmetLogoProps {
  size?: number;
  color?: string;
}

export default function HelmetLogo({ size = 80, color = '#FF6B35' }: HelmetLogoProps) {
  const strokeWidth = size * 0.04; // Thick lines
  
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G 
        stroke={color} 
        strokeWidth={strokeWidth} 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* Main helmet shell - rounded profile */}
        <Path d="
          M 55 15
          C 75 15, 88 30, 88 50
          C 88 70, 75 85, 55 88
          C 40 90, 28 85, 22 75
          C 18 68, 18 58, 22 48
          C 26 38, 35 25, 55 15
        "/>
        
        {/* Sharp visor/beak pointing forward-down */}
        <Path d="
          M 35 32
          L 12 42
          L 15 48
          L 30 45
        "/>
        
        {/* Visor mounting screws */}
        <Circle cx="32" cy="35" r="2" fill={color} />
        <Circle cx="28" cy="42" r="2" fill={color} />
        
        {/* Eye port / visor opening */}
        <Path d="
          M 30 45
          C 32 38, 45 32, 60 35
          C 70 37, 78 42, 80 50
        "/>
        
        {/* Eye port bottom curve */}
        <Path d="
          M 28 55
          C 35 50, 50 48, 65 50
          C 75 52, 80 55, 82 60
        "/>
        
        {/* Chin bar with ribbed ventilation lines */}
        <Path d="
          M 22 60
          C 20 68, 22 76, 30 82
        "/>
        
        {/* Horizontal vent lines on chin bar */}
        <Path d="M 24 65 L 32 63"/>
        <Path d="M 25 70 L 35 68"/>
        <Path d="M 27 75 L 38 73"/>
        
        {/* Top shell contour line */}
        <Path d="
          M 45 18
          C 55 16, 70 20, 80 30
        "/>
        
        {/* Back of helmet detail */}
        <Path d="
          M 85 55
          C 86 65, 82 75, 72 82
        "/>
      </G>
    </Svg>
  );
}
