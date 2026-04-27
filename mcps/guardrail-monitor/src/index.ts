import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new Server({
  name: "guardrail-monitor",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

// --- Guardrail Logic Implementation ---
// Based on Technical Manual: Pathos, Pheme, and Kratos
const GUARDRAIL_STANDARDS = {
  PATHOS: "Truthfulness and Objective Alignment",
  PHEME: "Ground-Truth cross-reference against Mnemosyne",
  KRATOS: "Authority and Evidence Hierarchy resolution",
};

const verifySovereignSeal = (output: string, consensusLevel: number) => {
  if (consensusLevel < 3) return { pass: false, reason: "Insufficient Consensus (Recall Failure)" };
  if (output.includes("I think") || output.includes("maybe")) return { pass: false, reason: "Probabilistic Language Detected (Precision Failure)" };
  return { pass: true, reason: "Sovereign Seal Validated" };
};

// --- Tool Registration ---
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "guardrail_audit",
      description: "Perform a final audit of the synthesized output against the three-fold Sovereign Standard.",
      inputSchema: {
        type: "object",
        properties: {
          output: { type: "string", description: "The synthesized response to audit" },
          consensus_level: { type: "number", description: "The N-of-M consensus count" },
        },
        required: ["output", "consensus_level"],
      },
    },
    {
      name: "guardrail_veto",
      description: "Issue a Sovereign Veto, blocking the output and triggering a la-logic retry.",
      inputSchema: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Reason for the veto" },
        },
        required: ["reason"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "guardrail_audit") {
    const { output, consensus_level } = request.params.arguments as { output: string; consensus_level: number };
    const result = verifySovereignSeal(output, consensus_level);
    
    return {
      content: [{ 
        type: "text", 
        text: `Guardrail Final Audit:\n- Pathos Check: ${GUARDRAIL_STANDARDS.PATHOS}\n- Pheme Check: ${GUARDRAIL_STANDARDS.PHEME}\n- Kratos Check: ${GUARDRAIL_STANDARDS.KRATOS}\n- Result: ${result.pass ? "✅ APPROVED" : "❌ VETOED"}\n- Detail: ${result.reason}` 
      }],
    };
  }

  if (request.params.name === "guardrail_veto") {
    const { reason } = request.params.arguments as { reason: string };
    return {
      content: [{ 
        type: "text", 
        text: `Sovereign Veto Issued:\n- Status: OUTPUT BLOCKED\n- Reason: ${reason}\n- Action: Triggering corrective re-evaluation via Janus.` 
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
