#!/usr/bin/env node

/**
 * secrets-manager.js
 * Main CLI for secrets management.
 * 
 * Usage:
 *   node secrets-manager.js add <skill> <name> <value> <reason>
 *   node secrets-manager.js get <skill> <name> [reason]
 *   node secrets-manager.js rotate <skill> <name> <newValue>
 *   node secrets-manager.js delete <skill> <name> <reason>
 *   node secrets-manager.js list [skill]
 *   node secrets-manager.js audit [skill] [name]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORE_FILE = '/root/.openclaw/workspace/secrets/secrets-store.json';
const MASTER_KEY_FILE = '/root/.openclaw/workspace/secrets/secrets-master.key';
const AUDIT_FILE = '/root/.openclaw/workspace/secrets/secrets-audit.log';
const CONFIG_FILE = '/root/.openclaw/workspace/secrets/secrets-config.json';
const STORE_DIR = path.dirname(STORE_FILE);

// ── Init ────────────────────────────────────────────────────────────────────

function initStore() {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ version: '1.0.0', secrets: {} }, null, 2));
  }
  if (!fs.existsSync(AUDIT_FILE)) {
    fs.writeFileSync(AUDIT_FILE, '');
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ version: '1.0.0', mappings: {} }, null, 2));
  }
}

function loadStore() {
  return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
}

function saveStore(data) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
}

function loadAudit() {
  if (!fs.existsSync(AUDIT_FILE)) return [];
  return fs.readFileSync(AUDIT_FILE, 'utf8').trim().split('\n').filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

function appendAudit(entry) {
  fs.appendFileSync(AUDIT_FILE, JSON.stringify({ ...entry, timestamp: new Date().toISOString() }) + '\n');
}

function getMasterKey() {
  // Master key from environment variable
  const key = process.env.MJ_MASTER_KEY;
  if (!key) {
    throw new Error('MJ_MASTER_KEY environment variable not set. Cannot access secrets.');
  }
  return Buffer.from(key, 'base64');
}

// ── Crypto ──────────────────────────────────────────────────────────────────

function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString('base64'), tag: tag.toString('base64'), ciphertext: encrypted.toString('base64') };
}

function decrypt(ciphertext, iv, tag, key) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8');
}

// ── Commands ─────────────────────────────────────────────────────────────────

function cmdAdd(skill, name, value, reason) {
  initStore();
  const key = getMasterKey();
  const data = loadStore();
  const storeKey = `${skill}:${name}`;
  
  const existing = data.secrets[storeKey];
  const rotations = existing ? (existing.rotations || 0) : 0;
  
  const encrypted = encrypt(value, key);
  data.secrets[storeKey] = {
    ...encrypted,
    rotations,
    created: existing ? existing.created : new Date().toISOString(),
    lastRotated: new Date().toISOString()
  };
  
  saveStore(data);
  appendAudit({ action: 'write', skill, secret: name, caller: process.env.SESSION_ID || 'cli', reason });
  console.log(`✓ Secret '${name}' stored for skill '${skill}'`);
  console.log(`  Rotations: ${rotations}`);
}

function cmdGet(skill, name, reason) {
  initStore();
  const key = getMasterKey();
  const data = loadStore();
  const storeKey = `${skill}:${name}`;
  
  const secret = data.secrets[storeKey];
  if (!secret) {
    throw new Error(`Secret '${name}' not found for skill '${skill}'`);
  }
  
  const plaintext = decrypt(secret.ciphertext, secret.iv, secret.tag, key);
  appendAudit({ action: 'read', skill, secret: name, caller: process.env.SESSION_ID || 'cli', reason: reason || 'internal-use' });
  
  // Return plaintext — caller (MJ) uses this internally, never prints it
  return plaintext;
}

function cmdRotate(skill, name, newValue) {
  initStore();
  const key = getMasterKey();
  const data = loadStore();
  const storeKey = `${skill}:${name}`;
  
  const existing = data.secrets[storeKey];
  if (!existing) {
    throw new Error(`Secret '${name}' not found for skill '${skill}' — cannot rotate non-existent secret`);
  }
  
  const encrypted = encrypt(newValue, key);
  data.secrets[storeKey] = {
    ...encrypted,
    rotations: (existing.rotations || 0) + 1,
    created: existing.created,
    lastRotated: new Date().toISOString()
  };
  
  saveStore(data);
  appendAudit({ action: 'rotate', skill, secret: name, caller: process.env.SESSION_ID || 'cli', reason: 'rotation' });
  console.log(`✓ Secret '${name}' rotated for skill '${skill}'`);
  console.log(`  Total rotations: ${data.secrets[storeKey].rotations}`);
}

function cmdDelete(skill, name, reason) {
  initStore();
  const data = loadStore();
  const storeKey = `${skill}:${name}`;
  
  if (!data.secrets[storeKey]) {
    throw new Error(`Secret '${name}' not found for skill '${skill}'`);
  }
  
  delete data.secrets[storeKey];
  saveStore(data);
  appendAudit({ action: 'delete', skill, secret: name, caller: process.env.SESSION_ID || 'cli', reason });
  console.log(`✓ Secret '${name}' deleted from skill '${skill}'`);
}

function cmdList(skill) {
  initStore();
  const data = loadStore();
  
  if (skill) {
    const prefix = `${skill}:`;
    const matching = Object.keys(data.secrets).filter(k => k.startsWith(prefix));
    console.log(`\nSecrets for skill '${skill}':`);
    if (matching.length === 0) {
      console.log('  (none)');
    } else {
      matching.forEach(k => {
        const s = data.secrets[k];
        console.log(`  ${k.split(':')[1]} — rotations: ${s.rotations}, lastRotated: ${s.lastRotated}`);
      });
    }
  } else {
    const skills = [...new Set(Object.keys(data.secrets).map(k => k.split(':')[0]))];
    console.log(`\n${skills.length} skill(s) with secrets:`);
    skills.forEach(s => {
      const count = Object.keys(data.secrets).filter(k => k.startsWith(`${s}:`)).length;
      console.log(`  ${s}: ${count} secret(s)`);
    });
  }
}

function cmdAudit(skill, name) {
  const entries = loadAudit();
  let filtered = entries;
  
  if (skill) {
    filtered = filtered.filter(e => e.skill === skill);
    if (name) {
      filtered = filtered.filter(e => e.secret === name);
    }
  }
  
  console.log(`\nAudit log (${filtered.length} entries):`);
  filtered.slice(-20).reverse().forEach(e => {
    console.log(`  [${e.timestamp}] ${e.action.toUpperCase()} | ${e.skill}:${e.secret} | ${e.caller} | ${e.reason}`);
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

const [,, action, ...args] = process.argv;

const COMMANDS = {
  add: () => { if (args.length < 4) throw new Error('Usage: add <skill> <name> <value> <reason>'); cmdAdd(args[0], args[1], args[2], args[3]); },
  get: () => {
    if (args.length < 2) throw new Error('Usage: get <skill> <name> [reason]');
    const val = cmdGet(args[0], args[1], args[2]);
    // Print only to stderr so it doesn't leak — MJ reads it via return
    console.error('__SECRET_VALUE__' + val + '__SECRET_VALUE__');
  },
  rotate: () => { if (args.length < 3) throw new Error('Usage: rotate <skill> <name> <newValue>'); cmdRotate(args[0], args[1], args[2]); },
  delete: () => { if (args.length < 3) throw new Error('Usage: delete <skill> <name> <reason>'); cmdDelete(args[0], args[1], args[2]); },
  list: () => cmdList(args[0]),
  audit: () => cmdAudit(args[0], args[1]),
};

if (!action || !COMMANDS[action]) {
  console.log('Usage: node secrets-manager.js <command> [args]');
  console.log('Commands: add, get, rotate, delete, list, audit');
  process.exit(1);
}

try {
  COMMANDS[action]();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
