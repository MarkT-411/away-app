const sharp = require('sharp');
const path = require('path');

async function processLogo() {
  const inputPath = '/tmp/correct-helmet.jpeg';
  const outputDir = './assets/images';
  
  // Read and get metadata
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  console.log('Original image:', metadata.width, 'x', metadata.height);
  
  // Create high-quality PNG for the app (main logo)
  await sharp(inputPath)
    .resize(1024, 1024, { 
      fit: 'cover',
      kernel: sharp.kernel.lanczos3 // High quality resampling
    })
    .sharpen({ sigma: 1.0 }) // Slight sharpening for clarity
    .png({ 
      quality: 100,
      compressionLevel: 9
    })
    .toFile(path.join(outputDir, 'helmet-logo.png'));
  console.log('✅ Created helmet-logo.png (1024x1024)');
  
  // iOS App Icon (1024x1024 for App Store)
  await sharp(inputPath)
    .resize(1024, 1024, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.8 })
    .png({ quality: 100 })
    .toFile(path.join(outputDir, 'icon.png'));
  console.log('✅ Created icon.png (1024x1024) for iOS');
  
  // Android Adaptive Icon (1024x1024)
  await sharp(inputPath)
    .resize(1024, 1024, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.8 })
    .png({ quality: 100 })
    .toFile(path.join(outputDir, 'adaptive-icon.png'));
  console.log('✅ Created adaptive-icon.png (1024x1024) for Android');
  
  // Favicon (192x192)
  await sharp(inputPath)
    .resize(192, 192, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 1.2 })
    .png({ quality: 100 })
    .toFile(path.join(outputDir, 'favicon.png'));
  console.log('✅ Created favicon.png (192x192)');
  
  // Splash icon (smaller for splash screen, 288x288)
  await sharp(inputPath)
    .resize(288, 288, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 1.0 })
    .png({ quality: 100 })
    .toFile(path.join(outputDir, 'splash-icon.png'));
  console.log('✅ Created splash-icon.png (288x288)');
  
  console.log('\n🎉 All icons generated successfully!');
}

processLogo().catch(console.error);
