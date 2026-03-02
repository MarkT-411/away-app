const sharp = require('sharp');
const path = require('path');

// Clean helmet SVG with accurate proportions
const svgContent = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#1A1A1A"/>
  
  <g transform="translate(512, 512) scale(5)" stroke="#FF6B35" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Main helmet shell outline - clean rounded profile -->
    <path d="
      M 22 -10
      Q 28 0, 26 12
      Q 24 24, 12 30
      Q -2 36, -16 32
      Q -26 28, -30 18
      Q -34 8, -30 -2
      Q -26 -14, -10 -22
      Q 6 -28, 18 -22
      Q 24 -18, 22 -10
    "/>
    
    <!-- Sharp visor/peak - triangular pointing forward-up -->
    <path d="
      M -26 -8
      L -44 -18
      L -40 -8
      L -28 0
    "/>
    
    <!-- Eye port / visor opening - smooth curves -->
    <path d="
      M -28 0
      Q -14 -8, 4 -6
      Q 18 -4, 24 4
    "/>
    
    <path d="
      M -30 8
      Q -12 2, 6 4
      Q 20 6, 26 14
    "/>
    
    <!-- Chin guard curve -->
    <path d="
      M -30 -2
      Q -34 8, -32 18
      Q -30 28, -18 32
    "/>
    
    <!-- Chin vent lines - 4 horizontal slits -->
    <path d="M -32 6 L -18 3"/>
    <path d="M -32 12 L -14 9"/>
    <path d="M -31 18 L -12 15"/>
    <path d="M -28 24 L -10 21"/>
  </g>
</svg>`;

const outputDir = path.join(__dirname, 'assets', 'images');

async function generateIcons() {
  console.log('Generating helmet icons...');
  
  await sharp(Buffer.from(svgContent)).resize(1024, 1024).png().toFile(path.join(outputDir, 'icon.png'));
  await sharp(Buffer.from(svgContent)).resize(1024, 1024).png().toFile(path.join(outputDir, 'adaptive-icon.png'));
  await sharp(Buffer.from(svgContent)).resize(48, 48).png().toFile(path.join(outputDir, 'favicon.png'));
  await sharp(Buffer.from(svgContent)).resize(200, 200).png().toFile(path.join(outputDir, 'splash-icon.png'));

  console.log('Done!');
}

generateIcons().catch(console.error);
