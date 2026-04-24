import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioProcessTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new Server({
  name: "kairos",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "kairos_filter",
      description: "Filter retrieved fragments for maximum epistemic relevance.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "The core query" },
          fragments: { type: "string", description: "The raw retrieved data from Mnemosyne" },
        },
        required: ["query", "fragments"],
      },
    },
    {
      name: "kairos_urgency",
      description: "Determine the temporal urgency of a query (Real-time vs Archival).",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "The query to assess" },
        },
        required: ["query"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "kairos_filter") {
    const { query, fragments } = request.params.arguments as { query: string; fragments: string };
    
    // Logic: Simulation of a relevance filter
    // In a real impl, this would use vector similarity
    const lines = fragments.split('\\n');
    const filtered = lines.filter(line => {
      const keywords = query.toLowerCase().split(' ');
      const matchCount = keywords.filter(k => line.toLowerCase().includes(k)).length;
      return matchCount / keywords.length >= 0.3; // Simple 30% keyword match threshold
    });

    return {
      content: [{ 
        type: "text", 
        text: `Kairos Filter Complete:\\n- Original Fragments: ${lines.length}\\n- Filtered Fragments: ${filtered.length}\\n- Culling Rate: ${((1 - filtered.length/lines.length)*100).toFixed(1)}%\\n\\nFiltered Context:\\n${filtered.join('\\n')}` 
      }],
    };
  }

  if (request.params.name === "kairos_urgency") {
    const { query } = request.params.arguments as { query: string };
    
    const realTimeKeywords = ['now', 'today', 'current', 'latest', 'live', 'recent'];
    const isRealTime = realTimeKeywords.some(k => query.toLowerCase().includes(k));

    return {
      content: [{ 
        type: "text", 
        text: `Urgency Assessment:\\n- Mode: ${isRealTime ? 'REAL-TIME' : 'ARCHIVAL'}\\n- Logic: ${isRealTime ? 'Temporal keywords detected.' : 'No urgency triggers found.'}` 
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
