import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Database, aql } from "arangojs";
import dotenv from "dotenv";

dotenv.config();

// ArangoDB connection
const ARANGO_URL = process.env.ARANGO_URL || "http://localhost:8529";
const ARANGO_DB = process.env.ARANGO_DB || "abraxas_db";
const ARANGO_USER = process.env.ARANGO_USER || "root";
const ARANGO_PASSWORD = process.env.ARANGO_PASSWORD || "";

let db: Database;

async function initDatabase() {
  db = new Database({
    url: ARANGO_URL,
    databaseName: ARANGO_DB,
    auth: {
      username: ARANGO_USER,
      password: ARANGO_PASSWORD,
    },
  });
}

// Tool implementations
async function queryProvenance(args: { entityId: string; entityType: string }) {
  const { entityId, entityType } = args;
  
  const query = aql`
    LET entity = DOCUMENT(${entityType}, ${entityId})
    LET provenanceChain = (
      FOR v, e, p IN 1..10 INBOUND ${entityId} provenanceChain
      RETURN {
        vertex: v,
        edge: e,
        path: p
      }
    )
    RETURN {
      entity: entity,
      provenanceChain: provenanceChain,
      chainLength: LENGTH(provenanceChain)
    }
  `;
  
  const result = await db.query(query);
  return result.all();
}

async function sieveHypotheses(args: {
  minNovelty?: number;
  minCoherence?: number;
  creativeDrivers?: string[];
  limit?: number;
}) {
  const { minNovelty = 0, minCoherence = 0, creativeDrivers = [], limit = 100 } = args;
  
  let filters = [];
  if (minNovelty > 0) {
    filters.push(`h.noveltyScore >= ${minNovelty}`);
  }
  if (minCoherence > 0) {
    filters.push(`h.coherenceScore >= ${minCoherence}`);
  }
  if (creativeDrivers.length > 0) {
    const drivers = creativeDrivers.map(d => `"${d}"`).join(", ");
    filters.push(`COUNT(INTERSECTION(h.creativeDrivers || [], [${drivers}])) > 0`);
  }
  
  const filterClause = filters.length > 0 ? `FILTER ${filters.join(" AND ")}` : "";
  
  const query = aql`
    FOR h IN hypotheses
    ${filterClause}
    SORT h.noveltyScore DESC, h.coherenceScore DESC
    LIMIT ${limit}
    RETURN h
  `;
  
  const result = await db.query(query);
  return result.all();
}

async function anchorConcepts(args: { conceptId: string }) {
  const { conceptId } = args;
  
  const query = aql`
    LET concept = DOCUMENT(concepts, ${conceptId})
    LET anchoredPlans = (
      FOR v, e, p IN 1..5 OUTBOUND ${conceptId} anchorsTo, leadsTo, generates
      FILTER IS_SAME_COLLECTION(v, plans)
      RETURN {
        plan: v,
        relationship: e,
        path: p
      }
    )
    RETURN {
      concept: concept,
      anchoredPlans: anchoredPlans,
      planCount: LENGTH(anchoredPlans)
    }
  `;
  
  const result = await db.query(query);
  return result.all();
}

async function traverseGraph(args: {
  startVertex: string;
  direction: "inbound" | "outbound" | "any";
  minDepth: number;
  maxDepth: number;
  edgeFilter?: string;
}) {
  const { startVertex, direction, minDepth, maxDepth, edgeFilter } = args;
  
  const dirMap = {
    inbound: "INBOUND",
    outbound: "OUTBOUND",
    any: "ANY",
  };
  
  const dir = dirMap[direction] || "ANY";
  const filterClause = edgeFilter ? `FILTER ${edgeFilter}` : "";
  
  const query = aql`
    FOR v, e, p IN ${minDepth}..${maxDepth} ${dir} ${startVertex}
    ${filterClause}
    RETURN {
      vertex: v,
      edge: e,
      path: p,
      depth: LENGTH(p.edges)
    }
  `;
  
  const result = await db.query(query);
  return result.all();
}

// Resource handlers
async function getSessionResource(sessionId: string) {
  const query = aql`
    FOR s IN sessions
    FILTER s._key == ${sessionId}
    RETURN s
  `;
  const result = await db.query(query);
  const session = await result.next();
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }
  return {
    uri: `dream://sessions/${sessionId}`,
    mimeType: "application/json",
    text: JSON.stringify(session, null, 2),
  };
}

async function getHypothesisResource(hypothesisId: string) {
  const query = aql`
    FOR h IN hypotheses
    FILTER h._key == ${hypothesisId}
    RETURN h
  `;
  const result = await db.query(query);
  const hypothesis = await result.next();
  if (!hypothesis) {
    throw new Error(`Hypothesis ${hypothesisId} not found`);
  }
  return {
    uri: `dream://hypotheses/${hypothesisId}`,
    mimeType: "application/json",
    text: JSON.stringify(hypothesis, null, 2),
  };
}

async function getConceptResource(conceptId: string) {
  const query = aql`
    FOR c IN concepts
    FILTER c._key == ${conceptId}
    RETURN c
  `;
  const result = await db.query(query);
  const concept = await result.next();
  if (!concept) {
    throw new Error(`Concept ${conceptId} not found`);
  }
  return {
    uri: `dream://concepts/${conceptId}`,
    mimeType: "application/json",
    text: JSON.stringify(concept, null, 2),
  };
}

async function getPlanResource(planId: string) {
  const query = aql`
    FOR p IN plans
    FILTER p._key == ${planId}
    RETURN p
  `;
  const result = await db.query(query);
  const plan = await result.next();
  if (!plan) {
    throw new Error(`Plan ${planId} not found`);
  }
  return {
    uri: `dream://plans/${planId}`,
    mimeType: "application/json",
    text: JSON.stringify(plan, null, 2),
  };
}

// Prompt templates
const ANALYZE_PROVENANCE_PROMPT = {
  name: "analyze_provenance",
  description: "Guide users through understanding a plan's origin and provenance chain",
  arguments: [
    {
      name: "planId",
      description: "The ID of the plan to analyze",
      required: true,
    },
  ],
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: "Analyze the provenance chain for plan {{planId}}. Trace back through all contributing hypotheses, concepts, and sessions. Identify key decision points and creative drivers that led to this plan.",
      },
    },
  ],
};

const FIND_INSPIRATIONS_PROMPT = {
  name: "find_inspirations",
  description: "Discover cross-pollination between ideas across the knowledge graph",
  arguments: [
    {
      name: "conceptId",
      description: "Starting concept to find inspirations for",
      required: true,
    },
    {
      name: "maxDepth",
      description: "Maximum traversal depth (default: 3)",
      required: false,
    },
  ],
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: "Find inspirations and cross-pollination for concept {{conceptId}}. Traverse the knowledge graph up to {{maxDepth}} hops to discover related concepts, hypotheses, and plans. Highlight unexpected connections and creative bridges.",
      },
    },
  ],
};

async function main() {
  await initDatabase();

  const server = new Server(
    {
      name: "abraxas-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // List tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "query_provenance",
          description: "Retrieve full provenance chain for any plan, hypothesis, or session",
          inputSchema: {
            type: "object",
            properties: {
              entityId: {
                type: "string",
                description: "The ID of the entity to query",
              },
              entityType: {
                type: "string",
                description: "The collection type (plans, hypotheses, concepts, sessions)",
              },
            },
            required: ["entityId", "entityType"],
          },
        },
        {
          name: "sieve_hypotheses",
          description: "Filter hypotheses by novelty score, coherence, or creative drivers",
          inputSchema: {
            type: "object",
            properties: {
              minNovelty: {
                type: "number",
                description: "Minimum novelty score threshold",
              },
              minCoherence: {
                type: "number",
                description: "Minimum coherence score threshold",
              },
              creativeDrivers: {
                type: "array",
                items: { type: "string" },
                description: "Filter by specific creative drivers",
              },
              limit: {
                type: "number",
                description: "Maximum number of results to return",
              },
            },
          },
        },
        {
          name: "anchor_concepts",
          description: "Ground concepts into actionable plans",
          inputSchema: {
            type: "object",
            properties: {
              conceptId: {
                type: "string",
                description: "The concept ID to anchor",
              },
            },
            required: ["conceptId"],
          },
        },
        {
          name: "traverse_graph",
          description: "Execute custom AQL traversals on the knowledge graph",
          inputSchema: {
            type: "object",
            properties: {
              startVertex: {
                type: "string",
                description: "Starting vertex ID for traversal",
              },
              direction: {
                type: "string",
                enum: ["inbound", "outbound", "any"],
                description: "Traversal direction",
              },
              minDepth: {
                type: "number",
                description: "Minimum traversal depth",
              },
              maxDepth: {
                type: "number",
                description: "Maximum traversal depth",
              },
              edgeFilter: {
                type: "string",
                description: "Optional AQL filter expression for edges",
              },
            },
            required: ["startVertex", "direction", "minDepth", "maxDepth"],
          },
        },
      ],
    };
  });

  // Call tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result;
      switch (name) {
        case "query_provenance":
          result = await queryProvenance(args as { entityId: string; entityType: string });
          break;
        case "sieve_hypotheses":
          result = await sieveHypotheses(args as any);
          break;
        case "anchor_concepts":
          result = await anchorConcepts(args as { conceptId: string });
          break;
        case "traverse_graph":
          result = await traverseGraph(args as any);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  // List resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: "dream://sessions/{id}",
          name: "Dream Session",
          description: "Individual dream session data",
          mimeType: "application/json",
        },
        {
          uri: "dream://hypotheses/{id}",
          name: "Hypothesis",
          description: "Individual hypothesis data",
          mimeType: "application/json",
        },
        {
          uri: "dream://concepts/{id}",
          name: "Concept",
          description: "Individual concept data",
          mimeType: "application/json",
        },
        {
          uri: "dream://plans/{id}",
          name: "Plan",
          description: "Individual actionable plan data",
          mimeType: "application/json",
        },
      ],
    };
  });

  // Read resource
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    try {
      if (uri.startsWith("dream://sessions/")) {
        const sessionId = uri.replace("dream://sessions/", "");
        return {
          contents: [await getSessionResource(sessionId)],
        };
      } else if (uri.startsWith("dream://hypotheses/")) {
        const hypothesisId = uri.replace("dream://hypotheses/", "");
        return {
          contents: [await getHypothesisResource(hypothesisId)],
        };
      } else if (uri.startsWith("dream://concepts/")) {
        const conceptId = uri.replace("dream://concepts/", "");
        return {
          contents: [await getConceptResource(conceptId)],
        };
      } else if (uri.startsWith("dream://plans/")) {
        const planId = uri.replace("dream://plans/", "");
        return {
          contents: [await getPlanResource(planId)],
        };
      } else {
        throw new Error(`Unknown resource URI: ${uri}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to read resource: ${error.message}`);
    }
  });

  // List prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [ANALYZE_PROVENANCE_PROMPT, FIND_INSPIRATIONS_PROMPT],
    };
  });

  // Get prompt
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "analyze_provenance") {
      return {
        messages: ANALYZE_PROVENANCE_PROMPT.messages.map((msg) => ({
          role: msg.role,
          content: {
            type: "text",
            text: msg.content.text.replace("{{planId}}", args?.planId || ""),
          },
        })),
      };
    } else if (name === "find_inspirations") {
      return {
        messages: FIND_INSPIRATIONS_PROMPT.messages.map((msg) => ({
          role: msg.role,
          content: {
            type: "text",
            text: msg.content.text
              .replace("{{conceptId}}", args?.conceptId || "")
              .replace("{{maxDepth}}", (args?.maxDepth || 3).toString()),
          },
        })),
      };
    } else {
      throw new Error(`Unknown prompt: ${name}`);
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Abraxas MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
