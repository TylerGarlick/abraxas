/**
 * abraxas-logos/index.js
 * MCP Server for Logos verification layer
 * Integrates Pheme (fact-checking) and Janus (epistemic labeling)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { 
  verify, 
  verifyWithFallback, 
  getHistory, 
  clearCache,
  VerificationStatus,
  JanusLabel,
  AtomType
} from './verify.js';

// Server metadata
const SERVER_NAME = 'abraxas-logos';
const SERVER_VERSION = '1.0.0';

/**
 * Create the MCP server
 */
function createServer() {
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Set up the tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'logos_verify',
          description: 'Verify atomic propositions using Pheme (fact-checking) and Janus (epistemic labeling). Takes atoms from the claim parser and returns verification results with epistemic labels.',
          inputSchema: {
            type: 'object',
            properties: {
              atoms: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of atomic propositions to verify'
              },
              skipCache: {
                type: 'boolean',
                description: 'Skip cached results and re-verify',
                default: false
              },
              saveToHistory: {
                type: 'boolean',
                description: 'Save results to verification history',
                default: true
              }
            },
            required: ['atoms']
          }
        },
        {
          name: 'logos_verify_single',
          description: 'Verify a single atomic proposition (convenience method)',
          inputSchema: {
            type: 'object',
            properties: {
              atom: {
                type: 'string',
                description: 'Atomic proposition to verify'
              },
              skipCache: {
                type: 'boolean',
                description: 'Skip cached results and re-verify',
                default: false
              }
            },
            required: ['atom']
          }
        },
        {
          name: 'logos_verify_fallback',
          description: 'Verify atoms with fallback strategy - retries individual atoms if batch fails',
          inputSchema: {
            type: 'object',
            properties: {
              atoms: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of atomic propositions to verify'
              }
            },
            required: ['atoms']
          }
        },
        {
          name: 'logos_history',
          description: 'Get verification history',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of results to return',
                default: 50
              }
            }
          }
        },
        {
          name: 'logos_clear_cache',
          description: 'Clear the verification cache',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'logos_status',
          description: 'Get verification system status',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'logos_pipeline',
          description: 'Full verification pipeline: takes atoms from claim parser, verifies each, labels with Janus, and returns combined results for the confidence engine',
          inputSchema: {
            type: 'object',
            properties: {
              atoms: {
                type: 'array',
                items: { type: 'string' },
                description: 'Atomic propositions from claim parser'
              },
              context: {
                type: 'string',
                description: 'Optional context about the original claim'
              }
            },
            required: ['atoms']
          }
        }
      ]
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'logos_verify': {
          const result = await verify({
            atoms: args.atoms,
            skipCache: args.skipCache || false,
            saveToHistory: args.saveToHistory !== false
          });
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        }

        case 'logos_verify_single': {
          const result = await verify({
            atoms: args.atom,
            skipCache: args.skipCache || false
          });
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        }

        case 'logos_verify_fallback': {
          const result = await verifyWithFallback(args.atoms);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        }

        case 'logos_history': {
          const history = getHistory(args.limit || 50);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ history }, null, 2)
              }
            ]
          };
        }

        case 'logos_clear_cache': {
          const result = clearCache();
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        }

        case 'logos_status': {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  service: SERVER_NAME,
                  version: SERVER_VERSION,
                  integrations: {
                    pheme: 'fact-checking API',
                    janus: 'epistemic labeling'
                  },
                  status: 'operational'
                }, null, 2)
              }
            ]
          };
        }

        case 'logos_pipeline': {
          // Full pipeline: verify atoms and prepare for confidence engine
          const result = await verify({
            atoms: args.atoms,
            saveToHistory: true
          });
          
          // Format for confidence engine (Task 100.3)
          const pipelineOutput = {
            context: args.context || '',
            atoms: result.results.map(r => ({
              text: r.atom,
              type: r.atomType,
              verification: r.verification,
              epistemic: r.epistemic,
              combinedLabel: `${r.combinedLabel}${r.verificationLabel}`.trim(),
              confidence: calculateConfidence(r)
            })),
            summary: result.summary,
            readyForConfidenceEngine: true
          };
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(pipelineOutput, null, 2)
              }
            ]
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: error.message }, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  return server;
}

/**
 * Calculate confidence score for an atom
 * @param {Object} result - Verification result
 * @returns {number} Confidence score 0-1
 */
function calculateConfidence(result) {
  const verificationConfidence = result.verification?.confidence || 0;
  const epistemicConfidence = result.epistemic?.confidence || 0;
  
  // Weight verification result more heavily for factual claims
  if (result.atomType === AtomType.FACTUAL) {
    return (verificationConfidence * 0.7) + (epistemicConfidence * 0.3);
  }
  
  // For non-factual, rely more on epistemic assessment
  return (verificationConfidence * 0.3) + (epistemicConfidence * 0.7);
}

// Main entry point
async function main() {
  const transport = new StdioServerTransport();
  const server = createServer();
  
  await server.connect(transport);
  console.error(`${SERVER_NAME} v${SERVER_VERSION} running on stdio`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});