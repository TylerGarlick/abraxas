import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";

const server = new Server({
  name: "episteme",
  version: "1.1.0",
}, {
  capabilities: {
    tools: {},
  },
});

const VAULT_PATH = "/root/.openclaw/workspace/abraxas/vault/sovereign_vault.json";
const LEDGER_PATH = "/root/.openclaw/workspace/abraxas/memory/epistemic-ledger.json";

const ORIGIN_CODES = {
  DIR: "Direct (Parametric Memory)",
  INF: "Inferred (Reasoning Chain)",
  RET: "Retrieval (Sovereign Vault)",
  ART: "Artifact (Training Pattern)",
  CONF: "Confabulated (No Grounding)",
};

const readJson = (p: string) => {
  try {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8"));
    }
  } catch (e) {
    console.error(`[Episteme] Error reading ${p}: ${e}`);
  }
  return null;
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "episteme_trace",
      description: "Trace the epistemic origin of a specific claim by querying the Sovereign Vault and Epistemic Ledger.",
      inputSchema: {
        type: "object",
        properties: {
          claim: { type: "string", description: "The claim to trace" },
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
    const { claim } = request.params.arguments as { claim: string };
    
    // 1. Check Sovereign Vault (Retrieval)
    const vault = readJson(VAULT_PATH);
    if (vault && vault.fragments) {
      const fragment = vault.fragments.find((f: any) => 
        f.fragment.toLowerCase().includes(claim.toLowerCase())
      );
      if (fragment) {
        return {
          content: [{ 
            type: "text", 
            text: `Origin: [RET] ${ORIGIN_CODES.RET}\nEvidence: Found in Sovereign Vault (ID: ${fragment.id}). Provenance: ${fragment.provenance}` 
          }],
        };
      }
    }

    // 2. Check Epistemic Ledger (Direct/Inferred)
    const ledger = readJson(LEDGER_PATH);
    if (ledger && Array.isArray(ledger)) {
      const entry = ledger.find((e: any) => 
        e.claim && e.claim.toLowerCase().includes(claim.toLowerCase())
      );
      if (entry) {
        const origin = entry.origin || "DIR";
        return {
          content: [{ 
            type: "text", 
            text: `Origin: [${origin}] ${ORIGIN_CODES[origin as keyof typeof ORIGIN_CODES] || "Unknown"}\nEvidence: Found in Epistemic Ledger. Entry Date: ${entry.timestamp || "Unknown"}` 
          }],
        };
      }
    }

    // 3. Heuristic Fallback (Artifact Detection)
    if (claim.toLowerCase().includes("as an ai language model")) {
      return {
        content: [{ 
          type: "text", 
          text: `Origin: [ART] ${ORIGIN_CODES.ART}\nEvidence: Matches known LLM training artifact pattern.` 
        }],
      };
    }

    // 4. Final Fallback (Confabulation/Parametric)
    return {
      content: [{ 
        type: "text", 
        text: `Origin: [DIR] ${ORIGIN_CODES.DIR}\nEvidence: No external trace found. Claim resides in parametric memory.` 
      }],
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
