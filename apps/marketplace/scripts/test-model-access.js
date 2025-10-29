#!/usr/bin/env node

/**
 * Test script to verify model files are accessible
 * Run this after building to ensure models are in the right place
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const staticModelsDir = path.join(buildDir, 'static', 'models');
const publicModelsDir = path.join(buildDir, 'models');

console.log('🔍 Testing model file accessibility...');
console.log('Build directory:', buildDir);

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run "yarn build" first.');
  process.exit(1);
}

// Check static/models directory
console.log('\n📁 Checking static/models directory...');
if (fs.existsSync(staticModelsDir)) {
  const files = fs.readdirSync(staticModelsDir);
  console.log('✅ static/models directory exists');
  console.log('Files:', files);
  
  // Check for required files
  const requiredFiles = ['model.json', 'weights.bin', 'metadata.json'];
  const missingFiles = requiredFiles.filter(file => !files.includes(file));
  
  if (missingFiles.length === 0) {
    console.log('✅ All required model files found in static/models/');
  } else {
    console.log('❌ Missing files in static/models/:', missingFiles);
  }
} else {
  console.log('❌ static/models directory not found');
}

// Check models directory (fallback)
console.log('\n📁 Checking models directory (fallback)...');
if (fs.existsSync(publicModelsDir)) {
  const files = fs.readdirSync(publicModelsDir);
  console.log('✅ models directory exists');
  console.log('Files:', files);
} else {
  console.log('❌ models directory not found');
}

// Test file sizes
console.log('\n📊 Checking file sizes...');
const modelJsonPath = path.join(staticModelsDir, 'model.json');
if (fs.existsSync(modelJsonPath)) {
  const stats = fs.statSync(modelJsonPath);
  console.log(`model.json size: ${(stats.size / 1024).toFixed(2)} KB`);
  
  if (stats.size < 1000) {
    console.log('⚠️  model.json seems too small, might be corrupted');
  }
}

const weightsPath = path.join(staticModelsDir, 'weights.bin');
if (fs.existsSync(weightsPath)) {
  const stats = fs.statSync(weightsPath);
  console.log(`weights.bin size: ${(stats.size / 1024).toFixed(2)} KB`);
  
  if (stats.size < 1000) {
    console.log('⚠️  weights.bin seems too small, might be corrupted');
  }
}

console.log('\n✅ Model accessibility test complete!');
