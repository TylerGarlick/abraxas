#!/usr/bin/env node

/**
 * setup-secrets.js
 * Initializes the secrets store — generates master key, sets environment.
 * Run once to bootstrap the secrets system.
 * 
 * Usage: node setup-secrets.js
 * 
 * Generates a 256-bit (32-byte) master key and saves it to secrets-master.key
 * Prints the key so it can be set as MJ_MASTER_KEY environment variable.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORE_DIR = '/root/.openclaw/workspace/secrets';
const KEY_FILE = path.join(STORE_DIR, 'secrets-master.key');

function generateMasterKey() {
  const key = crypto.randomBytes(32);
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(KEY_FILE, key.toString('hex'), { mode: 0o600 });
  console.log('✓ Master key generated and saved');
  console.log('\n⚠️  IMPORTANT — save this key securely:');
  console.log(`   ${key.toString('hex')}`);
  console.log('\nSet it as an environment variable:');
  console.log(`   export MJ_MASTER_KEY=${key.toString('hex')}`);
  console.log('\nAdd to your shell profile (~/.bashrc, ~/.zshrc, etc.) so it persists.');
  console.log('\n⚠️  If you lose this key, ALL secrets are unrecoverable.');
  return key.toString('hex');
}

generateMasterKey();
