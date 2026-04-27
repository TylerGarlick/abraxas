import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fs from "fs";
import path from "path";

const server = new Server({
  name: "mnemosyne-memory",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

const VAULT_PATH = "/root/.openclaw/workspace/abraxas/vault/sovereign_vault.json";

// Ensure vault exists
if (!fs.existsSync(path.dirname(VAULT_PATH))) {
  fs.mkdirSync(path.dirname(VAULT_PATH), { recursive: true });
}
if (!fs.existsSync(VAULT_PATH)) {
  fs.writeFileSync(VAULT_PATH, JSON.stringify({ fragments: [] }, null, 2));
}

const readVault = () => JSON.parse(fs.readFileSync(VAULT_PATH, "utf-8"));
const writeVault = (data: any) => fs.writeFileSync(VAULT_PATH, JSON.stringify(data, null, 2));

// --- Tool Registration ---
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "mnemosyne_recall",
      description: "Retrieve a verified knowledge fragment from the Sovereign Vault.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "The key or fragment ID to recall" },
        },
        required: ["query"],
      },
    },
    {
      name: "mnemosyne_store",
      description: "Store a verified truth fragment into the Sovereign Vault.",
      inputSchema: {
        type: "object",
        properties: {
          fragment: { type: "string", description: "The truth fragment to store" },
          provenance: { type: "string", description: "The source of the truth" },
        },
        required: ["fragment", "provenance"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "mnemosyne_recall") {
    const { query } = request.params.arguments as { query: string };
    const vault = readVault();
    
    const result = vault.fragments.find((f: any) => 
      f.fragment.toLowerCase().includes(query.toLowerCase()) || 
      f.id === query
    );

    return {
      content: [{ 
        type: "text", 
        text: result ? `Recalled Fragment: ${result.fragment}\nProvenance: ${result.provenance}` : "No matching fragment found in the Sovereign Vault." 
      }],
    };
  }

  if (request.params.name === "mnemosyne_store") {
    const { fragment, provenance } = request.params.arguments as { fragment: string; provenance: string };
    const vault = readVault();
    
    const newFragment = {
      id: `frag_${Date.now()}`,
      fragment,
      provenance,
      timestamp: new Date().toISOString()
    };
    
    vault.fragments.push(newFragment);
    writeVault(vault);

    return {
      content: [{ 
        type: "text", 
        text: `Sovereign Truth stored successfully. ID: ${newFragment.id}` 
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
