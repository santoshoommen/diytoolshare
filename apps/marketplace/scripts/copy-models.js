#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Copy model files to the build output directory
 * This ensures that TensorFlow.js models are available in production
 */

const sourceDir = path.join(__dirname, '..', 'public', 'models');
const buildDir = path.join(__dirname, '..', 'build');
const staticModelsDir = path.join(buildDir, 'static', 'models');
const publicModelsDir = path.join(buildDir, 'models');

console.log('Copying model files for production...');
console.log('Source directory:', sourceDir);
console.log('Build directory:', buildDir);

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error('Source models directory not found:', sourceDir);
  process.exit(1);
}

// Create build directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
  console.log('Creating build directory...');
  fs.mkdirSync(buildDir, { recursive: true });
}

// Create static/models directory
if (!fs.existsSync(staticModelsDir)) {
  console.log('Creating static/models directory...');
  fs.mkdirSync(staticModelsDir, { recursive: true });
}

// Create models directory (fallback)
if (!fs.existsSync(publicModelsDir)) {
  console.log('Creating models directory...');
  fs.mkdirSync(publicModelsDir, { recursive: true });
}

// Copy files to both locations for maximum compatibility
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      console.log(`Copying ${file} to ${destPath}`);
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

try {
  // Copy to static/models (primary location)
  copyDirectory(sourceDir, staticModelsDir);
  console.log('✅ Models copied to static/models/');
  
  // Copy to models (fallback location)
  copyDirectory(sourceDir, publicModelsDir);
  console.log('✅ Models copied to models/');
  
  console.log('✅ Model files copied successfully!');
} catch (error) {
  console.error('❌ Error copying model files:', error);
  process.exit(1);
}
