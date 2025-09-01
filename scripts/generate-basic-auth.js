#!/usr/bin/env node

/**
 * Generate secure basic auth credentials for development/staging
 * Usage: node scripts/generate-basic-auth.js
 */

const crypto = require('crypto');

// Generate a secure random password
const generateSecurePassword = (length = 16) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Generate credentials
const username = 'admin';
const password = generateSecurePassword(20);

console.log('🔐 Basic Auth Credentials Generated');
console.log('=====================================');
console.log(`Username: ${username}`);
console.log(`Password: ${password}`);
console.log('');
console.log('📝 Add these to your Render.com environment variables:');
console.log('');
console.log(`BASIC_AUTH_USERNAME=${username}`);
console.log(`BASIC_AUTH_PASSWORD=${password}`);
console.log('');
console.log('⚠️  Keep these credentials secure and don\'t commit them to version control!');
console.log('💡 You can also use any username/password combination you prefer.');
