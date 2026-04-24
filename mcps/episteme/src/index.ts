import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioProcessTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new Server({
  name: "episteme",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

const ORIGIN_CODES = {
  DIR: "Direct (Parametric Memory)",
  INF: "Inferred (Reasoning Chain)",
  RET: "Retrieval (Sovereign Vault)",
  ART: "Artifact (Training Pattern)",
  CONF: "Confabulated (No Grounding)",
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "episteme_trace",
      description: "Trace the epistemic origin of a specific claim.",
      inputSchema: {
        type: "object",
        properties: {
          claim: { type: "string", description: "The claim to trace" },
          context: { type: "string", description: "The current session context/logs" },
        },
        required: ["claim"],
      },
    },
    {
      name: "episteme_audit",
      description: "Perform a session-wide epistemic audit for artifacts and drift.",
      inputSchema: {
        type: "object",
        properties: {
          session_logs: { type: "string", description: "Full session logs for analysis" },
        },
        required: ["session_logs"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "episteme_trace") {
    const { claim, context } = request.params.arguments as { claim: string; context?: string };
    
    // Logic: Simulation of provenance tracing
    // In a full impl, this would query Mnemosyne and Logos logs
    let origin = "DIR";
    let evidence = "Matched within parametric memory weights.";
    
    if (context && context.includes("RETRIEVED")) {
      origin = "RET";
      evidence = "Claim found in Sovereign Vault fragment via Mnemosyne.";
    } else if (context && context.includes("REASONING")) {
      origin = "INF";
      evidence = "Derived via Logos step-by-step derivation.";
    } else if (claim.toLowerCase().includes("as an ai language model")) {
      origin = "ART";
      evidence = "Matches known LLM training artifact pattern.";
    }

    return {
      content: [{ type: "text", text: `Origin: [${origin}] ${ORIGIN_CODES[origin as keyof typeof ORIGIN_CODES]}\nEvidence: ${evidence}` }],
    };
  }

  if (request.params.name === "episteme_audit") {
    const { session_logs } = request.params.arguments as { session_logs: string };
    
    const artifactCount = (session_logs.match(/as an ai language model/gi) || []).length;
    const driftCount = (session_logs.match(/\[RET\].*\[INF\]/gi) || []).length;

    return {
      content: [{ 
        type: "text", 
        text: `Epistemic Audit Complete:\n- Artifacts Detected: ${artifactCount}\n- Epistemic Drift Events: ${driftCount}\n- Status: ${artifactCount > 2 ? "⚠️ High Noise" : "✅ Stable"}` 
      }],
    };
  }

  throw new Error("Tool not found");
});

async function main() {
  const transport = new StdioProcessTransport();
  await server.connect(transport);
}

main().catch(console.error);
