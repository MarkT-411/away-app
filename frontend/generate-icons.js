const sharp = require('sharp');
const path = require('path');

// Refined helmet SVG
const svgContent = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#1A1A1A"/>
  
  <g transform="translate(512, 512) scale(5)" stroke="#FF6B35" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Outer helmet shell - smooth oval shape -->
    <path d="
      M 20 -12
      C 26 -2, 26 10, 22 20
      C 18 28, 8 34, -4 34
      C -16 34, -26 28, -30 18
      C -34 8, -32 -4, -26 -12
      C -18 -22, -4 -26, 8 -24
      C 16 -22, 20 -18, 20 -12
    "/>
    
    <!-- Visor peak - sharp angular extension -->
    <path d="
      M -24 -10
      L -42 -20
      L -38 -10
      L -26 -2
    "/>
    
    <!-- Eye port top curve -->
    <path d="
      M -26 -2
      C -16 -8, 0 -10, 14 -4
      C 20 -2, 24 4, 24 10
    "/>
    
    <!-- Eye port bottom curve -->
    <path d="
      M -28 6
      C -16 0, 2 -2, 16 4
      C 22 6, 26 12, 26 18
    "/>
    
    <!-- Chin bar -->
    <path d="
      M -26 -12
      C -32 -4, -34 8, -32 18
      C -30 26, -22 32, -10 34
    "/>
    
    <!-- Horizontal chin vents -->
    <path d="M -30 2 L -14 -2"/>
    <path d="M -31 10 L -10 6"/>
    <path d="M -30 18 L -8 14"/>
    <path d="M -26 26 L -6 22"/>
  </g>
</svg>`;

const outputDir = path.join(__dirname, 'assets', 'images');

async function generateIcons() {
  console.log('Generating refined helmet icons...');
  
  await sharp(Buffer.from(svgContent)).resize(1024, 1024).png().toFile(path.join(outputDir, 'icon.png'));
  await sharp(Buffer.from(svgContent)).resize(1024, 1024).png().toFile(path.join(outputDir, 'adaptive-icon.png'));
  await sharp(Buffer.from(svgContent)).resize(48, 48).png().toFile(path.join(outputDir, 'favicon.png'));
  await sharp(Buffer.from(svgContent)).resize(200, 200).png().toFile(path.join(outputDir, 'splash-icon.png'));

  console.log('Done!');
}

generateIcons().catch(console.error);
