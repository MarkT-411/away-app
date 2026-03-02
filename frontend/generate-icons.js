const sharp = require('sharp');
const path = require('path');

// SVG matching the reference helmet image - accurate proportions
const svgContent = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark grey background -->
  <rect width="1024" height="1024" fill="#1A1A1A"/>
  
  <!-- Helmet centered and scaled -->
  <g transform="translate(512, 512) scale(4)" stroke="#FF6B35" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    
    <!-- Main helmet shell - smooth rounded curve -->
    <path d="
      M 25 -15
      C 30 -5, 32 5, 30 15
      C 28 25, 20 32, 8 35
      C -5 38, -18 35, -25 28
      C -30 23, -32 15, -30 5
      C -28 -5, -20 -15, -5 -22
      C 5 -27, 18 -25, 25 -15
    "/>
    
    <!-- Visor peak - sharp triangular pointing forward-up -->
    <path d="
      M -20 -8
      L -38 -15
      L -36 -8
      L -22 2
    "/>
    
    <!-- Eye port - elongated horizontal opening top -->
    <path d="
      M -22 2
      C -15 -8, 0 -10, 15 -6
      C 22 -4, 26 0, 28 5
    "/>
    
    <!-- Eye port bottom edge -->
    <path d="
      M -25 8
      C -15 4, 2 2, 18 5
      C 24 6, 28 10, 30 15
    "/>
    
    <!-- Chin bar outer curve -->
    <path d="
      M -30 5
      C -32 12, -32 20, -28 26
      C -24 32, -15 35, -5 35
    "/>
    
    <!-- Horizontal vent slits on chin bar - 4 parallel lines -->
    <path d="M -28 12 L -15 10"/>
    <path d="M -27 17 L -12 15"/>
    <path d="M -26 22 L -10 20"/>
    <path d="M -24 27 L -8 25"/>
    
    <!-- Top of helmet contour -->
    <path d="
      M -5 -22
      C 5 -25, 18 -22, 25 -15
    "/>
  </g>
</svg>`;

const outputDir = path.join(__dirname, 'assets', 'images');

async function generateIcons() {
  console.log('Generating helmet app icons with accurate proportions...');
  
  await sharp(Buffer.from(svgContent))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'icon.png'));
  console.log('✓ Generated icon.png (1024x1024)');

  await sharp(Buffer.from(svgContent))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'adaptive-icon.png'));
  console.log('✓ Generated adaptive-icon.png (1024x1024)');

  await sharp(Buffer.from(svgContent))
    .resize(48, 48)
    .png()
    .toFile(path.join(outputDir, 'favicon.png'));
  console.log('✓ Generated favicon.png (48x48)');

  await sharp(Buffer.from(svgContent))
    .resize(200, 200)
    .png()
    .toFile(path.join(outputDir, 'splash-icon.png'));
  console.log('✓ Generated splash-icon.png (200x200)');

  console.log('\n✅ All icons generated!');
}

generateIcons().catch(console.error);
