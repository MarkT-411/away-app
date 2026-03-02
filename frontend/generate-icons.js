const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG content for the TAM helmet icon
const svgContent = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark grey background -->
  <rect width="1024" height="1024" fill="#1A1A1A"/>
  
  <!-- Adventure Helmet - Profile facing left - Orange line art -->
  <g transform="translate(512, 512)" stroke="#FF6B35" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Main helmet shell -->
    <path d="
      M -80 -180
      C -200 -180, -280 -100, -300 40
      C -310 120, -280 200, -200 260
      C -120 310, 60 320, 160 280
      C 240 250, 300 180, 300 80
      C 300 -40, 260 -140, 180 -180
      C 100 -220, -20 -220, -80 -180
    "/>
    
    <!-- Visor peak (adventure helmet characteristic) -->
    <path d="
      M -280 -60
      L -380 -120
      L -360 -80
      L -280 -20
    "/>
    
    <!-- Visor/Eye shield area -->
    <path d="
      M -260 20
      C -240 -40, -140 -80, -40 -80
      C 60 -80, 140 -40, 180 20
    "/>
    
    <!-- Visor bottom line -->
    <path d="
      M -260 60
      C -200 40, -80 30, 40 40
      C 120 50, 180 70, 200 90
    "/>
    
    <!-- Chin guard / Lower helmet -->
    <path d="
      M -280 100
      C -300 160, -280 220, -200 260
    "/>
    
    <!-- Ventilation detail on chin -->
    <path d="
      M -220 180
      L -180 180
    "/>
    <path d="
      M -200 200
      L -160 200
    "/>
    
    <!-- Top vent detail -->
    <path d="
      M -40 -200
      C 0 -210, 60 -200, 80 -190
    "/>
    
    <!-- Back neck area detail -->
    <path d="
      M 200 140
      C 240 180, 240 220, 200 260
    "/>
  </g>
</svg>`;

const outputDir = path.join(__dirname, 'assets', 'images');

async function generateIcons() {
  console.log('Generating app icons...');
  
  // Main icon (1024x1024) for iOS App Store
  await sharp(Buffer.from(svgContent))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'icon.png'));
  console.log('✓ Generated icon.png (1024x1024)');

  // Adaptive icon for Android (1024x1024)
  await sharp(Buffer.from(svgContent))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'adaptive-icon.png'));
  console.log('✓ Generated adaptive-icon.png (1024x1024)');

  // Favicon for web (48x48)
  await sharp(Buffer.from(svgContent))
    .resize(48, 48)
    .png()
    .toFile(path.join(outputDir, 'favicon.png'));
  console.log('✓ Generated favicon.png (48x48)');

  // Splash icon (200x200)
  await sharp(Buffer.from(svgContent))
    .resize(200, 200)
    .png()
    .toFile(path.join(outputDir, 'splash-icon.png'));
  console.log('✓ Generated splash-icon.png (200x200)');

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
