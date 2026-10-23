#!/usr/bin/env node

/**
 * MCP Server for Secrets Manager
 * 
 * Provides secure secret management via Model Context Protocol with AES-256-GCM encryption.
 * 
 * Tools exposed:
 * - secrets_add: Add a new secret
 * - secrets_get: Retrieve a secret (internal use only)
 * - secrets_rotate: Rotate an existing secret
 * - secrets_delete: Delete a secret
 * - secrets_list: List secrets for a skill
 * - secrets_audit: View audit log
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Configuration ────────────────────────────────────────────────────────────

const STORE_FILE = '/root/.openclaw/workspace/secrets/secrets-store.json';
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
  const logEntry = { ...entry, timestamp: new Date().toISOString() };
  fs.appendFileSync(AUDIT_FILE, JSON.stringify(logEntry) + '\n');
}

function getMasterKey() {
  const key = process.env.MJ_MASTER_KEY;
  if (!key) {
    throw new Error('MJ_MASTER_KEY environment variable not set. Cannot access secrets.');
  }
  return Buffer.from(key, 'base64');
}

// ── AES-256-GCM Crypto ───────────────────────────────────────────────────────

/**
 * Encrypt plaintext using AES-256-GCM
 * @param {string} plaintext - The secret value to encrypt
 * @param {Buffer} key - 32-byte encryption key
 * @returns {{iv: string, tag: string, ciphertext: string}} Encrypted data (base64)
 */
function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(16); // 128-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag(); // 128-bit authentication tag
  
  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: encrypted.toString('base64')
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param {string} ciphertext - Base64 encrypted data
 * @param {string} iv - Base64 initialization vector
 * @param {string} tag - Base64 authentication tag
 * @param {Buffer} key - 32-byte encryption key
 * @returns {string} Decrypted plaintext
 */
function decrypt(ciphertext, iv, tag, key) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

// ── MCP Server Setup ─────────────────────────────────────────────────────────

const server = new McpServer({
  name: 'secrets-manager',
  version: '1.0.0',
  description: 'Secure secrets management with AES-256-GCM encryption'
});

// ── Tool: secrets_add ────────────────────────────────────────────────────────

server.tool(
  'secrets_add',
  'Add a new encrypted secret to the store',
  {
    skill: z.string().describe('Skill namespace (e.g., "github-factory", "huggingface-image-gen")'),
    name: z.string().describe('Secret name (e.g., "token", "api_key")'),
    value: z.string().describe('Secret value to encrypt and store'),
    reason: z.string().describe('Reason for adding this secret')
  },
  async ({ skill, name, value, reason }) => {
    try {
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
      appendAudit({
        action: 'write',
        skill,
        secret: name,
        caller: 'mcp-server',
        reason
      });
      
      return {
        content: [{
          type: 'text',
          text: `✓ Secret '${name}' stored for skill '${skill}'\n  Rotations: ${rotations}\n  Created: ${data.secrets[storeKey].created}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// ── Tool: secrets_get ────────────────────────────────────────────────────────

server.tool(
  'secrets_get',
  'Retrieve a decrypted secret value (INTERNAL USE ONLY - never display to end users)',
  {
    skill: z.string().describe('Skill namespace'),
    name: z.string().describe('Secret name'),
    reason: z.string().optional().default('internal-use').describe('Reason for access')
  },
  async ({ skill, name, reason }) => {
    try {
      initStore();
      const key = getMasterKey();
      const data = loadStore();
      const storeKey = `${skill}:${name}`;
      
      const secret = data.secrets[storeKey];
      if (!secret) {
        throw new Error(`Secret '${name}' not found for skill '${skill}'`);
      }
      
      const plaintext = decrypt(secret.ciphertext, secret.iv, secret.tag, key);
      appendAudit({
        action: 'read',
        skill,
        secret: name,
        caller: 'mcp-server',
        reason
      });
      
      // Return plaintext for internal use
      return {
        content: [{
          type: 'text',
          text: plaintext
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// ── Tool: secrets_rotate ─────────────────────────────────────────────────────

server.tool(
  'secrets_rotate',
  'Rotate an existing secret with a new value',
  {
    skill: z.string().describe('Skill namespace'),
    name: z.string().describe('Secret name'),
    newValue: z.string().describe('New secret value'),
    reason: z.string().optional().default('rotation').describe('Reason for rotation')
  },
  async ({ skill, name, newValue, reason }) => {
    try {
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
      appendAudit({
        action: 'rotate',
        skill,
        secret: name,
        caller: 'mcp-server',
        reason
      });
      
      return {
        content: [{
          type: 'text',
          text: `✓ Secret '${name}' rotated for skill '${skill}'\n  Total rotations: ${data.secrets[storeKey].rotations}\n  Last rotated: ${data.secrets[storeKey].lastRotated}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// ── Tool: secrets_delete ─────────────────────────────────────────────────────

server.tool(
  'secrets_delete',
  'Delete a secret from the store',
  {
    skill: z.string().describe('Skill namespace'),
    name: z.string().describe('Secret name'),
    reason: z.string().describe('Reason for deletion')
  },
  async ({ skill, name, reason }) => {
    try {
      initStore();
      const data = loadStore();
      const storeKey = `${skill}:${name}`;
      
      if (!data.secrets[storeKey]) {
        throw new Error(`Secret '${name}' not found for skill '${skill}'`);
      }
      
      delete data.secrets[storeKey];
      saveStore(data);
      appendAudit({
        action: 'delete',
        skill,
        secret: name,
        caller: 'mcp-server',
        reason
      });
      
      return {
        content: [{
          type: 'text',
          text: `✓ Secret '${name}' deleted from skill '${skill}'`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// ── Tool: secrets_list ───────────────────────────────────────────────────────

server.tool(
  'secrets_list',
  'List all secrets for a skill (names only, no values)',
  {
    skill: z.string().optional().describe('Filter by skill namespace (optional)')
  },
  async ({ skill }) => {
    try {
      initStore();
      const data = loadStore();
      
      let output = '';
      
      if (skill) {
        const prefix = `${skill}:`;
        const matching = Object.keys(data.secrets).filter(k => k.startsWith(prefix));
        output = `Secrets for skill '${skill}':\n`;
        if (matching.length === 0) {
          output += '  (none)';
        } else {
          matching.forEach(k => {
            const s = data.secrets[k];
            output += `  ${k.split(':')[1]} — rotations: ${s.rotations}, lastRotated: ${s.lastRotated}\n`;
          });
        }
      } else {
        const skills = [...new Set(Object.keys(data.secrets).map(k => k.split(':')[0]))];
        output = `${skills.length} skill(s) with secrets:\n`;
        skills.forEach(s => {
          const count = Object.keys(data.secrets).filter(k => k.startsWith(`${s}:`)).length;
          output += `  ${s}: ${count} secret(s)\n`;
        });
      }
      
      return {
        content: [{
          type: 'text',
          text: output.trim()
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// ── Tool: secrets_audit ──────────────────────────────────────────────────────

server.tool(
  'secrets_audit',
  'View audit log for secret access',
  {
    skill: z.string().optional().describe('Filter by skill namespace'),
    name: z.string().optional().describe('Filter by secret name'),
    limit: z.number().optional().default(20).describe('Maximum entries to return')
  },
  async ({ skill, name, limit }) => {
    try {
      const entries = loadAudit();
      let filtered = entries;
      
      if (skill) {
        filtered = filtered.filter(e => e.skill === skill);
        if (name) {
          filtered = filtered.filter(e => e.secret === name);
        }
      }
      
      const recent = filtered.slice(-limit).reverse();
      let output = `Audit log (${filtered.length} entries, showing ${recent.length}):\n`;
      
      recent.forEach(e => {
        output += `  [${e.timestamp}] ${e.action.toUpperCase()} | ${e.skill}:${e.secret} | ${e.caller} | ${e.reason}\n`;
      });
      
      return {
        content: [{
          type: 'text',
          text: output.trim()
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// ── Server Start ─────────────────────────────────────────────────────────────

async function main() {
  console.error('Starting Secrets Manager MCP Server...');
  console.error('AES-256-GCM encryption enabled');
  console.error('Store:', STORE_FILE);
  console.error('Audit:', AUDIT_FILE);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
