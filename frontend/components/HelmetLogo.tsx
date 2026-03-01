import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface HelmetLogoProps {
  size?: number;
  color?: string;
}

export default function HelmetLogo({ size = 80, color = '#FF6B35' }: HelmetLogoProps) {
  const strokeWidth = size * 0.035; // Scale stroke width with size
  
  return (
    <Svg width={size} height={size} viewBox="-400 -250 800 600">
      <G 
        stroke={color} 
        strokeWidth={strokeWidth} 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* Main helmet shell */}
        <Path d="
          M -80 -180
          C -200 -180, -280 -100, -300 40
          C -310 120, -280 200, -200 260
          C -120 310, 60 320, 160 280
          C 240 250, 300 180, 300 80
          C 300 -40, 260 -140, 180 -180
          C 100 -220, -20 -220, -80 -180
        "/>
        
        {/* Visor peak (adventure helmet characteristic) */}
        <Path d="
          M -280 -60
          L -380 -120
          L -360 -80
          L -280 -20
        "/>
        
        {/* Visor/Eye shield area */}
        <Path d="
          M -260 20
          C -240 -40, -140 -80, -40 -80
          C 60 -80, 140 -40, 180 20
        "/>
        
        {/* Visor bottom line */}
        <Path d="
          M -260 60
          C -200 40, -80 30, 40 40
          C 120 50, 180 70, 200 90
        "/>
        
        {/* Chin guard / Lower helmet */}
        <Path d="
          M -280 100
          C -300 160, -280 220, -200 260
        "/>
        
        {/* Ventilation detail on chin */}
        <Path d="M -220 180 L -180 180"/>
        <Path d="M -200 200 L -160 200"/>
        
        {/* Top vent detail */}
        <Path d="
          M -40 -200
          C 0 -210, 60 -200, 80 -190
        "/>
        
        {/* Back neck area detail */}
        <Path d="
          M 200 140
          C 240 180, 240 220, 200 260
        "/>
      </G>
    </Svg>
  );
}
