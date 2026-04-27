import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new Server({
  name: "soter-verifier",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

// --- Soter Logic Implementation ---
// Based on Technical Manual: Attention Sink monitoring
const SOTER_CONFIG = {
  tau: 0.49, // Threshold for trigger T
  monitored_heads: ["head_0", "head_12", "head_24"],
  sink_tokens: ["<BOS>", "!", ".", ",", "?", " "]
};

const assessRisk = (attentionWeights: any) => {
  // Implementation of Formula: T = 1 if 1/|H| * sum(sum(Ah(t, s))) > tau
  const { heads, sinks } = attentionWeights;
  let totalWeight = 0;
  
  heads.forEach((h: any) => {
    sinks.forEach((s: any) => {
      totalWeight += h[s] || 0;
    });
  });
  
  const avgWeight = totalWeight / (heads.length * sinks.length);
  return avgWeight > SOTER_CONFIG.tau ? 1 : 0;
};

// --- Tool Registration ---
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "soter_assess",
      description: "Analyze attention weights to detect a potential epistemic crisis (hallucination trigger).",
      inputSchema: {
        type: "object",
        properties: {
          attention_weights: { 
            type: "object", 
            description: "The weight matrix for monitored heads and sink tokens." 
          },
        },
        required: ["attention_weights"],
      },
    },
    {
      name: "soter_trigger",
      description: "Manually trigger an Epistemic Crisis signal (T=1) to force SOL mode.",
      inputSchema: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Reason for triggering crisis" },
        },
        required: ["reason"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "soter_assess") {
    const { attention_weights } = request.params.arguments as { attention_weights: any };
    const trigger = assessRisk(attention_weights);
    
    return {
      content: [{ 
        type: "text", 
        text: `Soter Risk Assessment:\n- Trigger Value (T): ${trigger}\n- Decision: ${trigger === 1 ? "🚨 EPISTEMIC CRISIS DETECTED" : "✅ Stable"}\n- Action: ${trigger === 1 ? "Rerouting to Consensus Verification Pipeline" : "Continue Probabilistic Generation"}` 
      }],
    };
  }

  if (request.params.name === "soter_trigger") {
    const { reason } = request.params.arguments as { reason: string };
    return {
      content: [{ 
        type: "text", 
        text: `Soter Manual Trigger:\n- Status: T=1 (FORCED)\n- Reason: ${reason}\n- Action: Immediate transition to SOL mode and multi-path spawning.` 
      }],
    };
  }

  throw new Error("Tool not found");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
