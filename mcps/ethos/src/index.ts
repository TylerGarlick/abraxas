import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioProcessTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fs from "fs";
import path from "path";

const server = new Server({
  name: "ethos",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

const REGISTRY_PATH = path.join(process.cwd(), "skills/ethos/references/ethos-registry.json");

function getRegistry() {
  try {
    const data = fs.readFileSync(REGISTRY_PATH, "utf8");
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "ethos_score",
      description: "Determine the credibility tier of a specific information source.",
      inputSchema: {
        type: "object",
        properties: {
          source: { type: "string", description: "The URL or name of the source" },
        },
        required: ["source"],
      },
    },
    {
      name: "ethos_resolve",
      description: "Resolve a conflict between two sources based on their credibility weights.",
      inputSchema: {
        type: "object",
        properties: {
          sourceA: { type: "string", description: "Source A" },
          sourceB: { type: "string", description: "Source B" },
        },
        required: ["sourceA", "sourceB"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const registry = getRegistry();

  if (request.params.name === "ethos_score") {
    const { source } = request.params.arguments as { source: string };
    
    let tier = "T5";
    let weight = 0.2;

    for (const [t, data] of Object.entries(registry)) {
      if (data.sources.some((s: string) => source.includes(s))) {
        tier = t;
        weight = data.weight;
        break;
      }
    }

    return {
      content: [{ type: "text", text: `Source: ${source}\nTier: ${tier}\nWeight: ${weight}\nStatus: ${registry[tier as keyof typeof registry]?.description}` }],
    };
  }

  if (request.params.name === "ethos_resolve") {
    const { sourceA, sourceB } = request.params.arguments as { sourceA: string; sourceB: string };
    
    const getWeight = (src: string) => {
      for (const [t, data] of Object.entries(registry)) {
        if (data.sources.some((s: string) => src.includes(s))) return data.weight as number;
      }
      return 0.2;
    };

    const weightA = getWeight(sourceA);
    const weightB = getWeight(sourceB);
    const winner = weightA > weightB ? sourceA : sourceB;
    const delta = Math.abs(weightA - weightB);

    return {
      content: [{ 
        type: "text", 
        text: `Conflict Resolution:\nSource A: ${weightA}\nSource B: ${weightB}\nWinner: ${winner}\nWeight Delta: ${delta.toFixed(2)}` 
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
