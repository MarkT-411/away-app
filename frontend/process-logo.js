const sharp = require('sharp');

async function processLogo() {
  const inputPath = '/tmp/original-helmet.jpeg';
  const outputPath = './assets/images/helmet-logo.png';
  
  const size = 512;
  const padding = 50;
  
  // Colors
  const darkGrayBg = '#1A1A1A';
  
  // Resize and colorize the helmet to orange
  const resizedHelmet = await sharp(inputPath)
    .resize(size - padding * 2, size - padding * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .negate({ alpha: false })
    .tint({ r: 255, g: 107, b: 53 }) // Orange #FF6B35
    .png()
    .toBuffer();
  
  // Create dark gray background
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
  
  // Composite helmet on background (no border)
  await sharp(background)
    .composite([
      {
        input: resizedHelmet,
        top: padding,
        left: padding,
      }
    ])
    .png()
    .toFile(outputPath);
  
  console.log('Logo created successfully:', outputPath);
}

processLogo().catch(console.error);
