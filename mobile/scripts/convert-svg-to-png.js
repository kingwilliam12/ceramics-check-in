const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertSvgToPng() {
  try {
    const svgPath = path.join(__dirname, '../src/assets/arrow-right.svg');
    const outputPath = path.join(__dirname, '../src/assets/arrow-right.png');
    
    // Read the SVG file
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Convert SVG to PNG using sharp
    await sharp(Buffer.from(svgContent))
      .resize(24, 24) // Set the size to 24x24 pixels
      .png()
      .toFile(outputPath);
    
    console.log('Successfully converted SVG to PNG');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    process.exit(1);
  }
}

convertSvgToPng();
