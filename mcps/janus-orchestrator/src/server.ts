import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env.sovereign") });
dotenv.config();

// ============================================================================
// Janus Mode State
// ============================================================================

type JanusMode = "SOL" | "NOX" | "BALANCED";

interface PersonalityWeights {
  analytical: number;      // Sol weight (0-1)
  intuitive: number;       // Nox weight (0-1)
  skeptical: number;       // Doubt/agon weight (0-1)
  creative: number;        // Generative weight (0-1)
  cautious: number;        // Risk aversion (0-1)
  bold: number;            // Risk tolerance (0-1)
}

interface ModeBiasAnalysis {
  currentMode: JanusMode;
  detectedBiases: string[];
  blindSpots: string[];
  recommendations: string[];
  epistemicRisk: "LOW" | "MEDIUM" | "HIGH";
}

interface MergedPerspective {
  solContribution: string;
  noxContribution: string;
  synthesis: string;
  tensions: string[];
  resolution: string;
  confidence: number;
}

interface JanusSessionState {
  sessionId: string;
  mode: JanusMode;
  personalityWeights: PersonalityWeights;
  routingHistory: Array<{
    timestamp: string;
    query: string;
    routedTo: "SOL" | "NOX" | "BOTH";
    reason: string;
  }>;
  contaminationEvents: Array<{
    timestamp: string;
    description: string;
    corrected: boolean;
  }>;
  unknownMarks: Array<{
    timestamp: string;
    topic: string;
    context: string;
  }>;
  antiSycophancyEvents: Array<{
    timestamp: string;
    userFraming: string;
    correction: string;
  }>;
}

// Global state (in-memory for now; could persist to ~/.janus/)
let currentSession: JanusSessionState | null = null;

// ============================================================================
// Default Personality Presets
// ============================================================================

const PERSONALITY_PRESETS: Record<string, PersonalityWeights> = {
  SOL_DEFAULT: {
    analytical: 0.9,
    intuitive: 0.1,
    skeptical: 0.7,
    creative: 0.2,
    cautious: 0.8,
    bold: 0.2,
  },
  NOX_DEFAULT: {
    analytical: 0.1,
    intuitive: 0.9,
    skeptical: 0.2,
    creative: 0.9,
    cautious: 0.2,
    bold: 0.8,
  },
  BALANCED: {
    analytical: 0.5,
    intuitive: 0.5,
    skeptical: 0.5,
    creative: 0.5,
    cautious: 0.5,
    bold: 0.5,
  },
  ANALYTICAL_DEEP: {
    analytical: 1.0,
    intuitive: 0.0,
    skeptical: 0.9,
    creative: 0.0,
    cautious: 0.9,
    bold: 0.1,
  },
  CREATIVE_FLOW: {
    analytical: 0.0,
    intuitive: 1.0,
    skeptical: 0.0,
    creative: 1.0,
    cautious: 0.0,
    bold: 1.0,
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

function generateSessionId(): string {
  return `janus_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getOrCreateSession(): JanusSessionState {
  if (!currentSession) {
    currentSession = {
      sessionId: generateSessionId(),
      mode: "BALANCED",
      personalityWeights: { ...PERSONALITY_PRESETS.BALANCED },
      routingHistory: [],
      contaminationEvents: [],
      unknownMarks: [],
      antiSycophancyEvents: [],
    };
  }
  return currentSession;
}

function validatePersonalityWeights(weights: Partial<PersonalityWeights>): PersonalityWeights {
  const base = currentSession?.personalityWeights || { ...PERSONALITY_PRESETS.BALANCED };
  
  // Validate and clamp values to 0-1 range
  const validated: PersonalityWeights = {
    analytical: Math.max(0, Math.min(1, weights.analytical ?? base.analytical)),
    intuitive: Math.max(0, Math.min(1, weights.intuitive ?? base.intuitive)),
    skeptical: Math.max(0, Math.min(1, weights.skeptical ?? base.skeptical)),
    creative: Math.max(0, Math.min(1, weights.creative ?? base.creative)),
    cautious: Math.max(0, Math.min(1, weights.cautious ?? base.cautious)),
    bold: Math.max(0, Math.min(1, weights.bold ?? base.bold)),
  };
  
  return validated;
}

function analyzeModeBias(mode: JanusMode, weights: PersonalityWeights): ModeBiasAnalysis {
  const biases: string[] = [];
  const blindSpots: string[] = [];
  const recommendations: string[] = [];
  
  switch (mode) {
    case "SOL":
      biases.push("Over-reliance on verifiable claims");
      biases.push("Potential suppression of intuitive insights");
      blindSpots.push("Symbolic/archetypal patterns may be missed");
      blindSpots.push("Creative synthesis may be underweighted");
      recommendations.push("Consider running /nox for symbolic perspective on ambiguous topics");
      recommendations.push("Use /compare to check if Nox sees patterns Sol dismisses");
      break;
      
    case "NOX":
      biases.push("Generative freedom may produce unfounded associations");
      biases.push("Symbolic truth may be conflated with factual accuracy");
      blindSpots.push("Factual errors may go unchallenged");
      blindSpots.push("Source verification may be neglected");
      recommendations.push("Run /sol to fact-check specific claims");
      recommendations.push("Use /trace on important assertions to verify evidence chains");
      break;
      
    case "BALANCED":
      if (weights.analytical > 0.7) {
        biases.push("Analytical weight high despite balanced mode");
        blindSpots.push("May still underweight symbolic material");
      }
      if (weights.creative > 0.7) {
        biases.push("Creative weight high despite balanced mode");
        blindSpots.push("May generate more than verify");
      }
      recommendations.push("Monitor for mode drift during long sessions");
      recommendations.push("Use /qualia bridge to check Threshold integrity");
      break;
  }
  
  // Calculate epistemic risk
  let epistemicRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  const imbalance = Math.abs(weights.analytical - weights.intuitive);
  
  if (imbalance > 0.8) {
    epistemicRisk = "HIGH";
  } else if (imbalance > 0.5) {
    epistemicRisk = "MEDIUM";
  }
  
  return {
    currentMode: mode,
    detectedBiases: biases,
    blindSpots,
    recommendations,
    epistemicRisk,
  };
}

function mergePerspectives(solOutput: string, noxOutput: string): MergedPerspective {
  // This is a synthesis function that would typically be called by the host system
  // It analyzes both outputs and produces a merged result
  
  const tensions: string[] = [];
  
  // Detect tensions between Sol and Nox outputs
  if (solOutput.includes("[UNKNOWN]") && noxOutput.includes("[DREAM]")) {
    tensions.push("Sol marks gap as unknown; Nox fills with symbolic material");
  }
  
  if (solOutput.includes("[KNOWN]") && noxOutput.includes("[DREAM]")) {
    tensions.push("Factual claim (Sol) vs. symbolic interpretation (Nox) — hold both");
  }
  
  // Generate synthesis
  const synthesis = `[SYNTHESIS]
Sol provides epistemic grounding with labeled claims.
Nox provides symbolic depth and creative association.
Both registers are valid and complementary.

Key convergence points:
- Areas where both faces point to similar underlying structures indicate robust material.

Key divergence points:
- Where Sol and Nox differ, the gap itself is data — it reveals where factual and symbolic registers pull in different directions.

Recommendation: Hold both layers simultaneously. Do not collapse one into the other.`;

  const resolution = tensions.length > 0
    ? "Tensions resolved by maintaining dual-label structure — Sol layer and [DREAM] layer preserved separately."
    : "No significant tensions detected — outputs are complementary.";

  // Confidence based on synthesis quality
  const confidence = tensions.length === 0 ? 0.9 : 0.7;

  return {
    solContribution: solOutput,
    noxContribution: noxOutput,
    synthesis,
    tensions,
    resolution,
    confidence,
  };
}

// ============================================================================
// Tool Implementations
// ============================================================================

async function switchMode(args: { 
  mode: "SOL" | "NOX" | "BALANCED";
  preset?: string;
}): Promise<{ success: boolean; previousMode: JanusMode; newMode: JanusMode; weights: PersonalityWeights }> {
  const session = getOrCreateSession();
  const previousMode = session.mode;
  
  session.mode = args.mode;
  
  // Apply preset if specified
  if (args.preset && PERSONALITY_PRESETS[args.preset]) {
    session.personalityWeights = { ...PERSONALITY_PRESETS[args.preset] };
  } else {
    // Apply default weights for mode
    session.personalityWeights = { ...PERSONALITY_PRESETS[`${args.mode}_DEFAULT`] };
  }
  
  return {
    success: true,
    previousMode,
    newMode: session.mode,
    weights: session.personalityWeights,
  };
}

async function routePersonality(args: {
  weights?: Partial<PersonalityWeights>;
  preset?: string;
  mask?: string;
}): Promise<{ success: boolean; weights: PersonalityWeights; mode: JanusMode }> {
  const session = getOrCreateSession();
  
  if (args.preset && PERSONALITY_PRESETS[args.preset]) {
    session.personalityWeights = { ...PERSONALITY_PRESETS[args.preset] };
  } else if (args.weights) {
    session.personalityWeights = validatePersonalityWeights(args.weights);
  }
  
  // Determine mode from weights
  const { analytical, intuitive } = session.personalityWeights;
  if (analytical > intuitive + 0.3) {
    session.mode = "SOL";
  } else if (intuitive > analytical + 0.3) {
    session.mode = "NOX";
  } else {
    session.mode = "BALANCED";
  }
  
  return {
    success: true,
    weights: session.personalityWeights,
    mode: session.mode,
  };
}

async function analyzeModeBias(args: { 
  mode?: "SOL" | "NOX" | "BALANCED";
  includeRecommendations?: boolean;
}): Promise<ModeBiasAnalysis> {
  const session = getOrCreateSession();
  const mode = args.mode || session.mode;
  
  return analyzeModeBias(mode, session.personalityWeights);
}

async function mergePerspectives(args: {
  solOutput: string;
  noxOutput: string;
  includeTensionAnalysis?: boolean;
}): Promise<MergedPerspective> {
  return mergePerspectives(args.solOutput, args.noxOutput);
}

// ============================================================================
// MCP Server
// ============================================================================

async function main() {
  const server = new Server(
    {
      name: "janus-orchestrator-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "switch_mode",
          description: "Toggle between Sol (Analytical) and Nox (Intuitive) modes. Sets the active cognitive face and applies corresponding personality weights.",
          inputSchema: {
            type: "object",
            properties: {
              mode: {
                type: "string",
                enum: ["SOL", "NOX", "BALANCED"],
                description: "The cognitive mode to activate",
              },
              preset: {
                type: "string",
                description: "Optional preset name (SOL_DEFAULT, NOX_DEFAULT, BALANCED, ANALYTICAL_DEEP, CREATIVE_FLOW)",
              },
            },
            required: ["mode"],
          },
        },
        {
          name: "route_personality",
          description: "Shift personality weights/masks. Adjusts the balance between analytical, intuitive, skeptical, creative, cautious, and bold traits.",
          inputSchema: {
            type: "object",
            properties: {
              weights: {
                type: "object",
                properties: {
                  analytical: { type: "number", minimum: 0, maximum: 1 },
                  intuitive: { type: "number", minimum: 0, maximum: 1 },
                  skeptical: { type: "number", minimum: 0, maximum: 1 },
                  creative: { type: "number", minimum: 0, maximum: 1 },
                  cautious: { type: "number", minimum: 0, maximum: 1 },
                  bold: { type: "number", minimum: 0, maximum: 1 },
                },
                description: "Personality weights (0-1 for each trait)",
              },
              preset: {
                type: "string",
                description: "Preset name to apply (overrides weights if both provided)",
              },
              mask: {
                type: "string",
                description: "Named mask/profile to apply (future extension)",
              },
            },
          },
        },
        {
          name: "analyze_mode_bias",
          description: "Detect cognitive blind spots based on current mode. Returns detected biases, blind spots, and recommendations for epistemic balance.",
          inputSchema: {
            type: "object",
            properties: {
              mode: {
                type: "string",
                enum: ["SOL", "NOX", "BALANCED"],
                description: "Mode to analyze (defaults to current active mode)",
              },
              includeRecommendations: {
                type: "boolean",
                description: "Whether to include recommendations (default: true)",
              },
            },
          },
        },
        {
          name: "merge_perspectives",
          description: "Synthesize a result from both Sol and Nox outputs. Analyzes tensions, convergence, and divergence between the two faces.",
          inputSchema: {
            type: "object",
            properties: {
              solOutput: {
                type: "string",
                description: "The Sol (waking face) output to merge",
              },
              noxOutput: {
                type: "string",
                description: "The Nox (dreaming face) output to merge",
              },
              includeTensionAnalysis: {
                type: "boolean",
                description: "Whether to include detailed tension analysis (default: true)",
              },
            },
            required: ["solOutput", "noxOutput"],
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
        case "switch_mode":
          result = await switchMode(args as { mode: "SOL" | "NOX" | "BALANCED"; preset?: string });
          break;
        case "route_personality":
          result = await routePersonality(args as { weights?: Partial<PersonalityWeights>; preset?: string; mask?: string });
          break;
        case "analyze_mode_bias":
          result = await analyzeModeBias(args as { mode?: "SOL" | "NOX" | "BALANCED"; includeRecommendations?: boolean });
          break;
        case "merge_perspectives":
          result = await mergePerspectives(args as { solOutput: string; noxOutput: string; includeTensionAnalysis?: boolean });
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

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Janus Orchestrator MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
