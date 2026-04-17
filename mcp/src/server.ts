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
import path from "path";
import fs from "fs";

dotenv.config({ path: path.join(__dirname, '../../.env.sovereign') });
dotenv.config();

// ArangoDB connection
const ARANGO_URL = process.env.ARANGO_URL || "http://localhost:8529";
const ARANGO_DB = process.env.ARANGO_DB || "abraxas_db";
const ARANGO_USER = process.env.ARANGO_USER || "root";
const ARANGO_PASSWORD = process.env.ARANGO_PASSWORD || "";

let db: Database;

// --- Sovereign Channels Configuration ---
function loadSovereignChannels(): Set<string> {
  const envChannels = process.env.SOVEREIGN_CHANNELS;
  if (envChannels) {
    return new Set(envChannels.split(',').map(id => id.trim()).filter(Boolean));
  }
  
  // Fallback to config file
  try {
    const configPath = path.join(__dirname, '../../config/sovereign-channels.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return new Set(config.sovereignChannels || []);
  } catch (e) {
    console.warn('Warning: Could not load sovereign channels config, defaulting to empty whitelist');
    return new Set();
  }
}

const SOVEREIGN_CHANNELS = loadSovereignChannels();

function validateSovereignChannel(channelId: string | undefined): void {
  if (!channelId) {
    throw new Error('Unauthorized: channelId is required for write operations');
  }
  if (!SOVEREIGN_CHANNELS.has(channelId)) {
    throw new Error(`Unauthorized: Channel ${channelId} is not authorized for write operations`);
  }
}

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

// --- Write Operations with Sovereign Channel Validation ---

async function startDreamCycle(args: { prompt: string; seedConcepts: string[]; channelId: string }) {
  const { prompt, seedConcepts, channelId } = args;
  validateSovereignChannel(channelId);
  
  const sessionColl = db.collection('dream_sessions');
  const session = {
    timestamp: new Date().toISOString(),
    userPrompt: prompt,
    seedConcepts,
    channelId,
  };
  const result = await sessionColl.save(session);
  return { _id: result._id, _key: result._key, ...session };
}

async function createHypothesis(args: {
  sessionId: string;
  rawPatternRepresentation: string;
  noveltyScore: number;
  coherenceScore: number;
  creativeDrivers: string[];
  channelId: string;
}) {
  const { sessionId, rawPatternRepresentation, noveltyScore, coherenceScore, creativeDrivers, channelId } = args;
  validateSovereignChannel(channelId);
  
  const hypoColl = db.collection('hypotheses');
  const edgeColl = db.collection('SESS_TO_HYPO');
  
  const hypoData = {
    rawPatternRepresentation,
    metadata: {
      noveltyScore,
      coherenceScore,
      creativeDrivers,
    },
    isValuable: false,
    channelId,
  };
  const hypoResult = await hypoColl.save(hypoData);
  
  const sessionColl = db.collection('dream_sessions');
  const session = await sessionColl.document(sessionId);
  if (!session) throw new Error('Session not found');
  
  await edgeColl.save({
    _from: `dream_sessions/${sessionId}`,
    _to: `hypotheses/${hypoResult._key}`,
    createdAt: new Date().toISOString(),
  });
  
  return { _id: hypoResult._id, _key: hypoResult._key, ...hypoData };
}

async function translateHypothesisToConcept(args: {
  hypothesisId: string;
  name: string;
  description: string;
  channelId: string;
}) {
  const { hypothesisId, name, description, channelId } = args;
  validateSovereignChannel(channelId);
  
  const conceptColl = db.collection('concepts');
  const edgeColl = db.collection('HYPO_TO_CONCEPT');
  
  const hypoColl = db.collection('hypotheses');
  const hypothesis = await hypoColl.document(hypothesisId);
  if (!hypothesis) throw new Error('Hypothesis not found');
  
  const conceptData = {
    name,
    description,
    channelId,
  };
  const conceptResult = await conceptColl.save(conceptData);
  
  await edgeColl.save({
    _from: `hypotheses/${hypothesisId}`,
    _to: `concepts/${conceptResult._key}`,
    createdAt: new Date().toISOString(),
  });
  
  return { _id: conceptResult._id, _key: conceptResult._key, ...conceptData };
}

async function groundConcept(args: {
  conceptId: string;
  summary: string;
  steps: string[];
  riskAssessment: string;
  channelId: string;
}) {
  const { conceptId, summary, steps, riskAssessment, channelId } = args;
  validateSovereignChannel(channelId);
  
  const planColl = db.collection('actionable_plans');
  const conceptColl = db.collection('concepts');
  const edgeColl = db.collection('CONCEPT_TO_PLAN');
  
  const concept = await conceptColl.document(conceptId);
  if (!concept) throw new Error('Concept not found');
  
  const planData = {
    summary,
    steps,
    riskAssessment,
    groundingStatus: 'ANCHORED',
    guardrailChecks: [],
    channelId,
  };
  const planResult = await planColl.save(planData);
  
  await edgeColl.save({
    _from: `concepts/${conceptId}`,
    _to: `actionable_plans/${planResult._key}`,
    createdAt: new Date().toISOString(),
  });
  
  return { _id: planResult._id, _key: planResult._key, ...planData };
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
        {
          name: "start_dream_cycle",
          description: "Start a new dream cycle session (requires sovereign channel)",
          inputSchema: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "User prompt to initiate the dream cycle",
              },
              seedConcepts: {
                type: "array",
                items: { type: "string" },
                description: "Seed concepts for the dream cycle",
              },
              channelId: {
                type: "string",
                description: "Discord channel ID (must be in sovereign whitelist)",
              },
            },
            required: ["prompt", "channelId"],
          },
        },
        {
          name: "create_hypothesis",
          description: "Create a new hypothesis from a dream session (requires sovereign channel)",
          inputSchema: {
            type: "object",
            properties: {
              sessionId: {
                type: "string",
                description: "The dream session ID",
              },
              rawPatternRepresentation: {
                type: "string",
                description: "Raw pattern representation of the hypothesis",
              },
              noveltyScore: {
                type: "number",
                description: "Novelty score (0-1)",
              },
              coherenceScore: {
                type: "number",
                description: "Coherence score (0-1)",
              },
              creativeDrivers: {
                type: "array",
                items: { type: "string" },
                description: "Creative drivers used",
              },
              channelId: {
                type: "string",
                description: "Discord channel ID (must be in sovereign whitelist)",
              },
            },
            required: ["sessionId", "rawPatternRepresentation", "noveltyScore", "coherenceScore", "creativeDrivers", "channelId"],
          },
        },
        {
          name: "translate_hypothesis_to_concept",
          description: "Translate a hypothesis to a concept (requires sovereign channel)",
          inputSchema: {
            type: "object",
            properties: {
              hypothesisId: {
                type: "string",
                description: "The hypothesis ID to translate",
              },
              name: {
                type: "string",
                description: "Name of the concept",
              },
              description: {
                type: "string",
                description: "Description of the concept",
              },
              channelId: {
                type: "string",
                description: "Discord channel ID (must be in sovereign whitelist)",
              },
            },
            required: ["hypothesisId", "name", "description", "channelId"],
          },
        },
        {
          name: "ground_concept",
          description: "Ground a concept as an actionable plan (requires sovereign channel)",
          inputSchema: {
            type: "object",
            properties: {
              conceptId: {
                type: "string",
                description: "The concept ID to ground",
              },
              summary: {
                type: "string",
                description: "Summary of the action plan",
              },
              steps: {
                type: "array",
                items: { type: "string" },
                description: "Steps in the action plan",
              },
              riskAssessment: {
                type: "string",
                description: "Risk assessment of the plan",
              },
              channelId: {
                type: "string",
                description: "Discord channel ID (must be in sovereign whitelist)",
              },
            },
            required: ["conceptId", "summary", "steps", "riskAssessment", "channelId"],
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
        case "start_dream_cycle":
          result = await startDreamCycle(args as { prompt: string; seedConcepts: string[]; channelId: string });
          break;
        case "create_hypothesis":
          result = await createHypothesis(args as any);
          break;
        case "translate_hypothesis_to_concept":
          result = await translateHypothesisToConcept(args as any);
          break;
        case "ground_concept":
          result = await groundConcept(args as any);
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
