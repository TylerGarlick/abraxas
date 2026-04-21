import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  PathosValueTracker,
  PhemeGroundTruthVerifier,
  KratosConflictArbiter,
  ValueEntry,
} from "./guardrails.js";

// ============================================================================
// MCP SERVER
// ============================================================================

// Initialize guardrail engines
const pathosTracker = new PathosValueTracker();
const phemeVerifier = new PhemeGroundTruthVerifier();
const kratosArbiter = new KratosConflictArbiter();

async function main() {
  const server = new Server(
    {
      name: "guardrail-monitor",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "check_value_saliency",
          description: "Pathos value-tracking: Check which user values are salient for a given topic or decision, detect value conflicts, and get alignment recommendations",
          inputSchema: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description: "The topic or decision to check value saliency for",
              },
              decisionContext: {
                type: "string",
                description: "Optional context about the decision being made",
              },
              userValues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    statement: { type: "string" },
                    salienceScore: { type: "number" },
                    explicit: { type: "boolean" },
                  },
                },
                description: "Optional explicit user values to include in analysis",
              },
            },
            required: ["topic"],
          },
        },
        {
          name: "verify_ground_truth",
          description: "Pheme ground-truth verification: Verify a claim against authoritative sources and get confidence-scored verification status",
          inputSchema: {
            type: "object",
            properties: {
              claim: {
                type: "string",
                description: "The factual claim to verify",
              },
              sources: {
                type: "array",
                items: { type: "string" },
                description: "Sources to check against (e.g., 'nature.com', 'reuters.com')",
              },
              requireMinSources: {
                type: "number",
                description: "Minimum number of supporting sources for VERIFIED status (default: 2)",
              },
            },
            required: ["claim"],
          },
        },
        {
          name: "arbitrate_conflict",
          description: "Kratos conflict arbitration: Resolve conflicts between competing claims using authority hierarchy and domain-specific precedence rules",
          inputSchema: {
            type: "object",
            properties: {
              claimA: {
                type: "string",
                description: "First claim in the conflict",
              },
              claimB: {
                type: "string",
                description: "Second claim in the conflict",
              },
              sourceA: {
                type: "string",
                description: "Source of claim A (e.g., 'Nature', 'Wikipedia')",
              },
              sourceB: {
                type: "string",
                description: "Source of claim B",
              },
              domain: {
                type: "string",
                description: "Domain context (e.g., 'medical', 'legal', 'scientific')",
              },
            },
            required: ["claimA", "claimB", "sourceA", "sourceB"],
          },
        },
      ],
    };
  });

  // Call tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result;
      switch (name) {
        case "check_value_saliency":
          result = pathosTracker.checkValueSaliency(args as {
            topic: string;
            decisionContext?: string;
            userValues?: ValueEntry[];
          });
          break;

        case "verify_ground_truth":
          result = phemeVerifier.verifyGroundTruth(args as {
            claim: string;
            sources?: string[];
            requireMinSources?: number;
          });
          break;

        case "arbitrate_conflict":
          result = kratosArbiter.arbitrateConflict(args as {
            claimA: string;
            claimB: string;
            sourceA: string;
            sourceB: string;
            domain?: string;
          });
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Guardrail Monitor MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
