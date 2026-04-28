#!/usr/bin/env node
/**
 * Sovereign Config Registry MCP Server
 * 
 * Provides centralized configuration access for all MCPs and skills.
 * Supports hot-reloading of SOVEREIGN_CONFIG.yaml via file watcher.
 * 
 * MCP Tools:
 * - config.get(path) - Fetch a config value by dot-notation path
 * - config.getAll() - Return entire config (with secrets masked)
 * - config.getSection(section) - Return a config section
 * - config.validate() - Validate current config against schema
 * - config.reload() - Force reload from file
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import * as path from 'path';
import * as os from 'os';

import { ConfigLoader } from './config-loader';
import { maskSecrets } from './secret-masker';
import { validateConfig } from './schema';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const HOME_DIR = os.homedir();
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/root/.openclaw/workspace';
const CONFIG_PATH = path.join(WORKSPACE_DIR, 'projects/abraxas/SOVEREIGN_CONFIG.yaml');

console.error(`[ConfigRegistry] Starting server...`);
console.error(`[ConfigRegistry] Config path: ${CONFIG_PATH}`);
console.error(`[ConfigRegistry] Workspace: ${WORKSPACE_DIR}`);

// ─────────────────────────────────────────────────────────────────────────────
// Initialize Config Loader
// ─────────────────────────────────────────────────────────────────────────────

const configLoader = new ConfigLoader({
  configPath: CONFIG_PATH,
  validateOnLoad: true
});

// Initial load
const initialLoad = configLoader.load();
if (!initialLoad.success) {
  console.error(`[ConfigRegistry] Initial load failed: ${initialLoad.error}`);
  process.exit(1);
}
console.error(`[ConfigRegistry] Config loaded successfully (version ${initialLoad.version})`);

// Set up file watcher for hot-reload
let fileWatcher: ReturnType<typeof setInterval> | null = null;
let lastMtime: number = 0;

function setupFileWatcher() {
  const fs = require('fs');
  
  try {
    lastMtime = fs.statSync(CONFIG_PATH).mtimeMs;
    
    fileWatcher = setInterval(() => {
      try {
        const stats = fs.statSync(CONFIG_PATH);
        if (stats.mtimeMs !== lastMtime) {
          console.error('[ConfigRegistry] Config file changed, reloading...');
          lastMtime = stats.mtimeMs;
          
          const result = configLoader.reload();
          if (result.success) {
            console.error(`[ConfigRegistry] Config reloaded successfully (version ${result.version})`);
          } else {
            console.error(`[ConfigRegistry] Reload failed: ${result.error}`);
          }
        }
      } catch (error) {
        console.error('[ConfigRegistry] File watcher error:', error);
      }
    }, 1000); // Check every second
    
    console.error('[ConfigRegistry] File watcher started (1s interval)');
  } catch (error) {
    console.error('[ConfigRegistry] Failed to setup file watcher:', error);
  }
}

setupFileWatcher();

// ─────────────────────────────────────────────────────────────────────────────
// MCP Tool Definitions
// ─────────────────────────────────────────────────────────────────────────────

const tools: Tool[] = [
  {
    name: 'config.get',
    description: 'Fetch a configuration value by dot-notation path (e.g., "Soter.RiskThreshold")',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Dot-notation path to config value (e.g., "Soter.RiskThreshold")'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'config.getAll',
    description: 'Return entire configuration with secrets masked',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'config.getSection',
    description: 'Return a specific configuration section (e.g., "Soter", "Ethos")',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description: 'Top-level section name (e.g., "Soter", "Ethos", "Core")'
        }
      },
      required: ['section']
    }
  },
  {
    name: 'config.validate',
    description: 'Validate current configuration against schema',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'config.reload',
    description: 'Force reload configuration from file',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// MCP Server
// ─────────────────────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: 'config-registry',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  console.error(`[ConfigRegistry] Tool call: ${name}`);
  
  try {
    switch (name) {
      case 'config.get': {
        const pathArg = args?.path as string;
        if (!pathArg) {
          return {
            content: [{ type: 'text', text: 'Error: path parameter is required' }],
            isError: true
          };
        }
        
        try {
          const value = configLoader.getValue(pathArg);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  value,
                  path: pathArg,
                  masked: false
                }, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
      
      case 'config.getAll': {
        const config = configLoader.getAll();
        if (!config) {
          return {
            content: [{ type: 'text', text: 'Error: Config not loaded' }],
            isError: true
          };
        }
        
        const { config: maskedConfig, maskedKeys } = maskSecrets(config);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                config: maskedConfig,
                maskedKeys,
                version: configLoader.getVersion(),
                lastLoadTime: configLoader.getLastLoadTime()
              }, null, 2)
            }
          ]
        };
      }
      
      case 'config.getSection': {
        const sectionArg = args?.section as string;
        if (!sectionArg) {
          return {
            content: [{ type: 'text', text: 'Error: section parameter is required' }],
            isError: true
          };
        }
        
        try {
          const section = configLoader.getSection(sectionArg);
          const { config: maskedSection, maskedKeys } = maskSecrets(section, sectionArg);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  section: sectionArg,
                  config: maskedSection,
                  maskedKeys,
                  masked: maskedKeys.length > 0
                }, null, 2)
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
      
      case 'config.validate': {
        const config = configLoader.getAll();
        if (!config) {
          return {
            content: [{ type: 'text', text: 'Error: Config not loaded' }],
            isError: true
          };
        }
        
        const validation = validateConfig(config);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                valid: validation.valid,
                errors: validation.errors,
                version: configLoader.getVersion()
              }, null, 2)
            }
          ]
        };
      }
      
      case 'config.reload': {
        const result = configLoader.reload();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.success,
                error: result.error || null,
                version: result.version,
                timestamp: result.timestamp
              }, null, 2)
            }
          ]
        };
      }
      
      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true
        };
    }
  } catch (error) {
    console.error(`[ConfigRegistry] Tool execution error:`, error);
    return {
      content: [
        {
          type: 'text',
          text: `Internal error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[ConfigRegistry] Server running on stdio');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.error('[ConfigRegistry] Shutting down...');
  if (fileWatcher) {
    clearInterval(fileWatcher);
  }
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('[ConfigRegistry] Shutting down...');
  if (fileWatcher) {
    clearInterval(fileWatcher);
  }
  await server.close();
  process.exit(0);
});

main().catch((error) => {
  console.error('[ConfigRegistry] Fatal error:', error);
  process.exit(1);
});
