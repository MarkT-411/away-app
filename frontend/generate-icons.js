const sharp = require('sharp');
const path = require('path');

const outputDir = path.join(__dirname, 'assets', 'images');

async function processHelmetImage() {
  console.log('Processing helmet image...');
  
  // Read the original image
  const image = sharp('/tmp/helmet_original.jpeg');
  const metadata = await image.metadata();
  
  console.log('Original image:', metadata.width, 'x', metadata.height);
  
  // Process the image:
  // 1. Make it square (1024x1024)
  // 2. Replace white background with dark grey
  // 3. Replace black helmet with orange
  
  // First, let's create the processed image
  // We'll use raw pixel manipulation
  const { data, info } = await image
    .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  console.log('Processing', info.width, 'x', info.height, 'pixels...');
  
  // Create new buffer with modified colors
  const newData = Buffer.alloc(data.length);
  
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate brightness
    const brightness = (r + g + b) / 3;
    
    if (brightness > 200) {
      // White/light area -> Dark grey background (#1A1A1A)
      newData[i] = 26;     // R
      newData[i + 1] = 26; // G
      newData[i + 2] = 26; // B
    } else if (brightness < 80) {
      // Dark/black area -> Orange (#FF6B35)
      newData[i] = 255;    // R
      newData[i + 1] = 107; // G
      newData[i + 2] = 53;  // B
    } else {
      // Gradient/transition area - interpolate
      const factor = (brightness - 80) / 120; // 0 to 1
      newData[i] = Math.round(255 * (1 - factor) + 26 * factor);     // R
      newData[i + 1] = Math.round(107 * (1 - factor) + 26 * factor); // G
      newData[i + 2] = Math.round(53 * (1 - factor) + 26 * factor);  // B
    }
    
    if (info.channels === 4) {
      newData[i + 3] = data[i + 3]; // Keep alpha
    }
  }
  
  // Save processed image
  await sharp(newData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
    .png()
    .toFile(path.join(outputDir, 'icon.png'));
  console.log('✓ icon.png (1024x1024)');
  
  await sharp(newData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
    .png()
    .toFile(path.join(outputDir, 'adaptive-icon.png'));
  console.log('✓ adaptive-icon.png (1024x1024)');
  
  await sharp(newData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
    .resize(48, 48)
    .png()
    .toFile(path.join(outputDir, 'favicon.png'));
  console.log('✓ favicon.png (48x48)');
  
  await sharp(newData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
    .resize(200, 200)
    .png()
    .toFile(path.join(outputDir, 'splash-icon.png'));
  console.log('✓ splash-icon.png (200x200)');
  
  // Also save a version for the welcome screen component
  await sharp(newData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
    .resize(150, 150)
    .png()
    .toFile(path.join(outputDir, 'helmet-logo.png'));
  console.log('✓ helmet-logo.png (150x150)');
  
  console.log('\n✅ All icons generated!');
}

processHelmetImage().catch(console.error);
