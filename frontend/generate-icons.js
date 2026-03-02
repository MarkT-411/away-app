const sharp = require('sharp');
const path = require('path');

// SVG with improved helmet shape matching reference
const svgContent = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#1A1A1A"/>
  
  <g transform="translate(512, 512) scale(5)" stroke="#FF6B35" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Main helmet shell - profile facing left -->
    <path d="
      M 20 -20
      C 28 -12, 32 0, 30 12
      C 28 24, 18 32, 5 35
      C -8 38, -20 34, -26 26
      C -30 20, -32 10, -28 0
    "/>
    
    <!-- Top curve of helmet -->
    <path d="
      M -28 0
      C -24 -12, -12 -22, 5 -25
      C 12 -26, 18 -24, 20 -20
    "/>
    
    <!-- Visor peak - prominent sharp angle extending forward -->
    <path d="
      M -22 -6
      L -42 -14
      L -40 -6
      L -24 2
    "/>
    
    <!-- Eye port top curve -->
    <path d="
      M -24 2
      C -16 -6, 0 -10, 16 -5
      C 24 -2, 28 4, 30 12
    "/>
    
    <!-- Eye port bottom -->
    <path d="
      M -26 10
      C -16 5, 2 2, 18 6
      C 26 8, 30 14, 30 20
    "/>
    
    <!-- Chin bar with vents -->
    <path d="
      M -28 0
      C -32 8, -32 18, -28 26
      C -24 32, -14 36, -2 36
    "/>
    
    <!-- Vent lines on chin - horizontal slits -->
    <path d="M -30 8 L -16 5"/>
    <path d="M -30 14 L -12 11"/>
    <path d="M -29 20 L -10 17"/>
    <path d="M -27 26 L -8 23"/>
  </g>
</svg>`;

const outputDir = path.join(__dirname, 'assets', 'images');

async function generateIcons() {
  console.log('Generating helmet icons...');
  
  await sharp(Buffer.from(svgContent))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'icon.png'));
  console.log('✓ icon.png');

  await sharp(Buffer.from(svgContent))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'adaptive-icon.png'));
  console.log('✓ adaptive-icon.png');

  await sharp(Buffer.from(svgContent))
    .resize(48, 48)
    .png()
    .toFile(path.join(outputDir, 'favicon.png'));
  console.log('✓ favicon.png');

  await sharp(Buffer.from(svgContent))
    .resize(200, 200)
    .png()
    .toFile(path.join(outputDir, 'splash-icon.png'));
  console.log('✓ splash-icon.png');

  console.log('Done!');
}

generateIcons().catch(console.error);
