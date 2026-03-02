const sharp = require('sharp');
const path = require('path');

// New SVG content for the TAM helmet icon - Motocross style with sharp visor
const svgContent = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark grey background -->
  <rect width="1024" height="1024" fill="#1A1A1A"/>
  
  <!-- Adventure/Motocross Helmet - Profile view - Thick orange lines -->
  <g transform="translate(512, 512) scale(4.5)" stroke="#FF6B35" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Main helmet shell - rounded profile -->
    <path d="
      M 5 -35
      C 25 -35, 38 -20, 38 0
      C 38 20, 25 35, 5 38
      C -10 40, -22 35, -28 25
      C -32 18, -32 8, -28 -2
      C -24 -12, -15 -25, 5 -35
    "/>
    
    <!-- Sharp visor/beak pointing forward-down -->
    <path d="
      M -15 -18
      L -38 -8
      L -35 -2
      L -20 -5
    "/>
    
    <!-- Visor mounting screws -->
    <circle cx="-18" cy="-15" r="2" fill="#FF6B35"/>
    <circle cx="-22" cy="-8" r="2" fill="#FF6B35"/>
    
    <!-- Eye port / visor opening -->
    <path d="
      M -20 -5
      C -18 -12, -5 -18, 10 -15
      C 20 -13, 28 -8, 30 0
    "/>
    
    <!-- Eye port bottom curve -->
    <path d="
      M -22 5
      C -15 0, 0 -2, 15 0
      C 25 2, 30 5, 32 10
    "/>
    
    <!-- Chin bar -->
    <path d="
      M -28 10
      C -30 18, -28 26, -20 32
    "/>
    
    <!-- Horizontal vent lines on chin bar -->
    <path d="M -26 15 L -18 13"/>
    <path d="M -25 20 L -15 18"/>
    <path d="M -23 25 L -12 23"/>
    
    <!-- Top shell contour line -->
    <path d="
      M -5 -32
      C 5 -34, 20 -30, 30 -20
    "/>
    
    <!-- Back of helmet detail -->
    <path d="
      M 35 5
      C 36 15, 32 25, 22 32
    "/>
  </g>
</svg>`;

const outputDir = path.join(__dirname, 'assets', 'images');

async function generateIcons() {
  console.log('Generating new helmet app icons...');
  
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

  console.log('\n✅ All helmet icons generated successfully!');
}

generateIcons().catch(console.error);
