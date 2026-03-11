#!/usr/bin/env node

// abraxas-mnemosyne MCP Server
// stdio transport for Claude Code integration

import { toolsRegistry, serverConfig } from './index.js';

const STDIO_DELIMITER = '\x00';

function send(json) {
  process.stdout.write(JSON.stringify(json) + STDIO_DELIMITER);
}

async function handleRequest(request) {
  const { method, id, params } = request;

  switch (method) {
    case 'initialize':
      send({
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {}
        },
        serverInfo: {
          name: serverConfig.name,
          version: serverConfig.version
        }
      });
      break;

    case 'tools/list':
      const toolList = Object.entries(tools).map(([name, def]) => ({
        name: def.name,
        description: def.description,
        inputSchema: def.inputSchema
      }));
      send({ tools: toolList });
      break;

    case 'tools/call':
      const { name, arguments: args } = params;
      const toolFn = toolsRegistry[name];
      
      if (!toolFn) {
        send({ 
          error: { code: -32601, message: `Tool not found: ${name}` },
          id 
        });
        return;
      }

      try {
        const result = await toolFn(...Object.values(args));
        send({ content: [{ type: 'text', text: JSON.stringify(result) }], id });
      } catch (err) {
        send({ 
          error: { code: -32603, message: err.message },
          id 
        });
      }
      break;

    default:
      send({ 
        error: { code: -32600, message: `Unknown method: ${method}` },
        id 
      });
  }
}

let buffer = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  
  const messages = buffer.split(STDIO_DELIMITER);
  buffer = messages.pop();

  for (const msg of messages) {
    if (msg.trim()) {
      try {
        const request = JSON.parse(msg);
        handleRequest(request);
      } catch (e) {
        console.error('Parse error:', e.message);
      }
    }
  }
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
