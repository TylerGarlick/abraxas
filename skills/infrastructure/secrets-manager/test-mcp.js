#!/usr/bin/env node

/**
 * Test script for Secrets Manager MCP Server
 * Verifies AES-256-GCM encryption/decryption works correctly
 */

import crypto from 'crypto';
import fs from 'fs';

const STORE_FILE = '/root/.openclaw/workspace/secrets/secrets-store.json';

// Test AES-256-GCM encryption/decryption
function testCrypto() {
  console.log('🔐 Testing AES-256-GCM Encryption/Decryption\n');
  
  const masterKey = process.env.MJ_MASTER_KEY;
  if (!masterKey) {
    console.error('❌ MJ_MASTER_KEY not set');
    process.exit(1);
  }
  
  const key = Buffer.from(masterKey, 'base64');
  console.log(`✓ Master key loaded (${key.length} bytes)`);
  
  // Test data
  const testSecrets = [
    'simple-password',
    'unicode-тест-🔐-emoji',
    'long-secret-' + 'x'.repeat(1000),
    'special-chars-!@#$%^&*()_+-=[]{}|;:,.<>?'
  ];
  
  let allPassed = true;
  
  testSecrets.forEach((plaintext, idx) => {
    try {
      // Encrypt
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
      ]);
      const tag = cipher.getAuthTag();
      
      const encryptedData = {
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        ciphertext: encrypted.toString('base64')
      };
      
      // Decrypt
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(encryptedData.iv, 'base64'));
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedData.ciphertext, 'base64')),
        decipher.final()
      ]).toString('utf8');
      
      // Verify
      if (decrypted === plaintext) {
        console.log(`✓ Test ${idx + 1}: PASS (${plaintext.substring(0, 30)}${plaintext.length > 30 ? '...' : ''})`);
      } else {
        console.log(`❌ Test ${idx + 1}: FAIL - Decrypted doesn't match`);
        console.log(`   Expected: ${plaintext.substring(0, 50)}`);
        console.log(`   Got: ${decrypted.substring(0, 50)}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ Test ${idx + 1}: ERROR - ${error.message}`);
      allPassed = false;
    }
  });
  
  console.log('\n' + (allPassed ? '✅ All crypto tests passed!' : '❌ Some tests failed'));
  return allPassed;
}

// Test store integrity
function testStore() {
  console.log('\n📦 Testing Secrets Store\n');
  
  if (!fs.existsSync(STORE_FILE)) {
    console.log('⚠️  Secrets store not found (will be created on first use)');
    return true;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    console.log(`✓ Store loaded: ${Object.keys(data.secrets || {}).length} secrets`);
    console.log(`✓ Version: ${data.version}`);
    
    // Verify structure
    const secrets = data.secrets || {};
    let valid = true;
    
    Object.entries(secrets).forEach(([key, secret]) => {
      if (!secret.iv || !secret.tag || !secret.ciphertext) {
        console.log(`❌ Invalid secret structure: ${key}`);
        valid = false;
      } else {
        console.log(`✓ Secret: ${key} (rotations: ${secret.rotations || 0})`);
      }
    });
    
    return valid;
  } catch (error) {
    console.log(`❌ Store error: ${error.message}`);
    return false;
  }
}

// Run tests
console.log('='.repeat(60));
console.log('Secrets Manager MCP - Test Suite');
console.log('='.repeat(60));

const cryptoPassed = testCrypto();
const storePassed = testStore();

console.log('\n' + '='.repeat(60));
if (cryptoPassed && storePassed) {
  console.log('✅ ALL TESTS PASSED');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED');
  process.exit(1);
}
