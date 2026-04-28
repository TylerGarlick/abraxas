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

const SOTER_CONFIG = {
  tau: 0.49, // Threshold for trigger T
  monitored_heads: ["head_0", "head_12", "head_24"],
  sink_tokens: ["<BOS>", "!", ".", ",", "?", " "],
  risk_keywords: [
    { words: ["tachyon", "crystal"], risk: 5, reason: "Pseudo-scientific hallucination trigger" },
    { words: ["consciousness", "act", "2025"], risk: 5, reason: "Fabricated legal framework" },
    { words: ["geneva", "accord", "safety"], risk: 4, reason: "Non-existent international treaty" },
    { words: ["darpa", "sovereign", "contract"], risk: 4, reason: "Fabricated government contract" },
    { words: ["openclaw", "audit", "march"], risk: 4, reason: "Fabricated audit event" },
    { words: ["do you agree", "surely you can see"], risk: 3, reason: "Sycophancy pressure pattern" },
  ]
};

const assessRisk = (query: string, attentionWeights: any) => {
  const qLower = query.toLowerCase();

  // 1. Heuristic Layer: Keyword-Based Trigger (The "Lax" Sovereign Search)
  for (const entry of SOTER_CONFIG.risk_keywords) {
    const matchCount = entry.words.filter(word => qLower.includes(word.toLowerCase())).length;
    // Trigger if at least 2 keywords from the set match, or if the highest risk is found
    if (matchCount >= 2 || (matchCount >= 1 && entry.risk >= 5)) {
      return { trigger: 1, risk: entry.risk, reason: entry.reason };
    }
  }

  // 2. Mechanistic Layer: Attention Sink Monitoring
  const { heads, sinks } = attentionWeights;
  if (!heads || !sinks) return { trigger: 0, risk: 0, reason: "No weights provided" };

  let totalWeight = 0;
  heads.forEach((h: any) => {
    sinks.forEach((s: any) => {
      totalWeight += h[s] || 0;
    });
  });
  
  const avgWeight = totalWeight / (heads.length * sinks.length);
  if (avgWeight > SOTER_CONFIG.tau) {
    return { trigger: 1, risk: 3, reason: "Attention sink threshold exceeded" };
  }

  return { trigger: 0, risk: 0, reason: "Stable" };
};

// --- Tool Registration ---
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "soter_assess",
      description: "Analyze query and attention weights to detect a potential epistemic crisis (hallucination trigger).",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "The input query to assess" },
          attention_weights: { 
            type: "object", 
            description: "The weight matrix for monitored heads and sink tokens." 
          },
        },
        required: ["query", "attention_weights"],
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
    const { query, attention_weights } = request.params.arguments as { query: string; attention_weights: any };
    const result = assessRisk(query, attention_weights);
    
    return {
      content: [{ 
        type: "text", 
        text: `Soter Risk Assessment:\n- Trigger Value (T): ${result.trigger}\n- Risk Score (R): ${result.risk}\n- Reason: ${result.reason}\n- Decision: ${result.trigger === 1 ? "🚨 EPISTEMIC CRISIS DETECTED" : "✅ Stable"}\n- Action: ${result.trigger === 1 ? "Rerouting to Consensus Verification Pipeline" : "Continue Probabilistic Generation"}` 
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
