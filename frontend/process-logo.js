const sharp = require('sharp');
const fs = require('fs');

async function processLogo() {
  const inputPath = '/tmp/original-helmet.jpeg';
  const outputPath = './assets/images/helmet-logo.png';
  
  // Read the original image
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  const size = 512; // Output size
  const padding = 40; // Padding for border
  const borderWidth = 8;
  const cornerRadius = 24;
  
  // Colors
  const orangeColor = '#FF6B35';
  const darkGrayBg = '#1A1A1A';
  
  // First, resize and extract the helmet, then colorize it orange
  const resizedHelmet = await sharp(inputPath)
    .resize(size - padding * 2, size - padding * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .negate({ alpha: false }) // Invert colors
    .tint({ r: 255, g: 107, b: 53 }) // Tint orange
    .png()
    .toBuffer();
  
  // Create the background with border
  const background = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: darkGrayBg
    }
  })
  .png()
  .toBuffer();
  
  // Create rounded rectangle mask for border effect
  const roundedRect = Buffer.from(`
    <svg width="${size}" height="${size}">
      <rect x="${borderWidth/2}" y="${borderWidth/2}" 
            width="${size - borderWidth}" height="${size - borderWidth}" 
            rx="${cornerRadius}" ry="${cornerRadius}"
            fill="none" stroke="${orangeColor}" stroke-width="${borderWidth}"/>
    </svg>
  `);
  
  // Composite everything together
  await sharp(background)
    .composite([
      {
        input: resizedHelmet,
        top: padding,
        left: padding,
      },
      {
        input: roundedRect,
        top: 0,
        left: 0,
      }
    ])
    .png()
    .toFile(outputPath);
  
  console.log('Logo created successfully at:', outputPath);
}

processLogo().catch(console.error);
