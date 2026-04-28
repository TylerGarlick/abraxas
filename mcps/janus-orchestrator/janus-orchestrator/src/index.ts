import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new Server({
  name: "janus-orchestrator",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

// --- Janus Logic Implementation ---
const COGNITIVE_MODES = {
  NOX: "Intuitive (Probabilistic)",
  SOL: "Analytical (Deterministic)",
};

const LENSES = {
  SKEPTIC: "The Skeptic - Searching for flaws and contradictions.",
  EXPERT: "The Expert - Focusing on technical accuracy.",
  ADVERSARY: "The Adversary - Attempting to break the logic.",
  ARCHIVIST: "The Archivist - Grounding claims in the Sovereign Vault.",
  GENERALIST: "The Generalist - Synthesizing a balanced view.",
};

const determineConsensus = (paths: any[]) => {
  const consensusMap = new Map();
  
  paths.forEach(p => {
    const claim = p.result.trim().toLowerCase();
    consensusMap.set(claim, (consensusMap.get(claim) || 0) + 1);
  });

  let bestClaim = "";
  let maxVotes = 0;
  
  for (const [claim, votes] of consensusMap.entries()) {
    if (votes > maxVotes) {
      maxVotes = votes;
      bestClaim = claim;
    }
  }

  return { bestClaim, maxVotes };
};

// --- Tool Registration ---
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "janus_switch_mode",
      description: "Switch the cognitive mode between NOX (Intuitive) and SOL (Analytical).",
      inputSchema: {
        type: "object",
        properties: {
          mode: { 
            type: "string", 
            enum: ["NOX", "SOL"], 
            description: "The target mode for the orchestrator." 
          },
          reason: { type: "string", description: "Reason for the mode switch." },
        },
        required: ["mode"],
      },
    },
    {
      name: "janus_spawn_paths",
      description: "Spawn M independent reasoning paths with specific epistemic lenses.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "The core claim or question to verify." },
          m_paths: { type: "number", description: "Number of paths to spawn (Default: 5)." },
        },
        required: ["query"],
      },
    },
    {
      name: "janus_resolve_consensus",
      description: "Apply the N-of-M deterministic agreement rule to a set of reasoning paths.",
      inputSchema: {
        type: "object",
        properties: {
          path_results: { 
            type: "array", 
            items: { type: "string" }, 
            description: "The results from the M spawned paths." 
          },
        },
        required: ["path_results"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "janus_switch_mode") {
    const { mode, reason } = request.params.arguments as { mode: string; reason?: string };
    return {
      content: [{ 
        type: "text", 
        text: `Janus Mode Switch:\n- New Mode: ${COGNITIVE_MODES[mode as keyof typeof COGNITIVE_MODES]}\n- Reason: ${reason || "Soter Trigger"}\n- Action: Cognitive state transitioned.` 
      }],
    };
  }

  if (request.params.name === "janus_spawn_paths") {
    const { query, m_paths = 5 } = request.params.arguments as { query: string; m_paths?: number };
    const paths = Object.values(LENSES).map((lens, i) => ({
      id: i + 1,
      lens: lens,
      query: query
    }));
    
    // In a real impl, these would be actual LLM calls.
    // For this verification, we return the la-logic of the spawn.
    return {
      content: [{ 
        type: "text", 
        text: `Janus Sovereign Spawning:\n- Query: ${query}\n- Paths Spawned: ${m_paths}\n- Lenses Assigned: ${Object.keys(LENSES).join(", ")}\n- Status: Ready for independent reasoning.` 
      }],
    };
  }

  if (request.params.name === "janus_resolve_consensus") {
    const { path_results } = request.params.arguments as { path_results: string[] };
    const { bestClaim, maxVotes } = determineConsensus(path_results);
    const total = path_results.length;
    
    const isSovereign = maxVotes >= 3; // Standard N=3
    const seal = isSovereign ? `[Sovereign Consensus: ${maxVotes}/${total}]` : `[Sovereign Unknown]`;
    
    return {
      content: [{ 
        type: "text", 
        text: `Janus Consensus Resolution:\n- Best Claim: ${bestClaim}\n- Votes: ${maxVotes}/${total}\n- Seal: ${seal}\n- Result: ${isSovereign ? "EMITTED" : "BLOCKED"}` 
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
