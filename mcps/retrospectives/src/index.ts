import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from "fs";
import path from "path";

const RETRO_BASE_DIR = path.join(process.cwd(), "..", "..", ".abraxas", "retrospectives");

const server = new McpServer({
  name: "retrospectives",
  version: "0.1.0",
});

interface RetroSubject {
  type: 'task' | 'day' | 'week';
  id: string;
  context?: string;
}

interface RetroSchema {
  timestamp: string;
  subject: RetroSubject;
  well: string[];
  notWell: string[];
  start: string[];
  stop: string[];
  continue: string[];
  improvements: string[];
  ledgerTasks: string[];
}

const getStoragePath = (date: string, type: string, id: string) => {
  const [year, month, day] = date.split('-');
  const folder = path.join(RETRO_BASE_DIR, year, month, day);
  const fileName = `${type}_${id}.json`;
  return { folder, filePath: path.join(folder, fileName) };
};

export { getStoragePath, RETRO_BASE_DIR };

server.tool(
  "save_retro",
  {
    date: z.string().describe("ISO date YYYY-MM-DD"),
    type: z.enum(['task', 'day', 'week']).describe("Type of retrospective"),
    id: z.string().describe("The ID of the task or a descriptor for day/week"),
    content: z.any().describe("The RetroSchema object containing the assessment"),
  },
  async ({ date, type, id, content }) => {
    const { folder, filePath } = getStoragePath(date, type, id);
    
    try {
      mkdirSync(folder, { recursive: true });
      writeFileSync(filePath, JSON.stringify(content, null, 2));
      return {
        content: [{ type: "text", text: `Retrospective saved to ${filePath}` }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error saving retrospective: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_retros_for_period",
  {
    start_date: z.string().describe("ISO start date YYYY-MM-DD"),
    end_date: z.string().describe("ISO end date YYYY-MM-DD"),
  },
  async ({ start_date, end_date }) => {
    const results: any[] = [];
    
    const walkDir = (dir: string) => {
      if (!readdirSync(dir)) return; // simplified
      const files = readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        try {
          const stats = readFileSync(fullPath, { flag: 'r' }); // check if accessible
          if (path.extname(file) === '.json') {
            results.push(JSON.parse(readFileSync(fullPath, 'utf-8')));
          } else {
            // This is a simplified walk: we only care about the folder structure
            // In a real impl we would check if it's a directory
          }
        } catch {}
      }
    };

    try {
      // Mock for demo: just reading the base dir if it exists
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error retrieving retros: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "create_ledger_task",
  {
    description: z.string().describe("Description of the task to be added to the ledger"),
    priority: z.string().describe("Priority (high, medium, low)"),
    source_retro_id: z.string().describe("ID of the retro that spawned this task"),
  },
  async ({ description, priority, source_retro_id }) => {
    const ledgerPath = path.join(RETRO_BASE_DIR, "ledger.json");
    let ledger = [];
    try {
      const content = readFileSync(ledgerPath, 'utf-8');
      ledger = JSON.parse(content);
    } catch {}

    ledger.push({ description, priority, source_retro_id, timestamp: new Date().toISOString() });
    writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));

    return {
      content: [{ type: "text", text: `Ledger task created: ${description} (Source: ${source_retro_id})` }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
