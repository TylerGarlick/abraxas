import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import path from "path";
import fs from "fs";
import express from "express";

// Import Soter logic from skills/soter
const SOTER_SCRIPTS_PATH = process.env.SOTER_SCRIPTS_PATH || path.join(__dirname, "../../../skills/soter/scripts");

const { assessRisk, logIncident, RISK_PATTERNS } = await import(
  path.join(SOTER_SCRIPTS_PATH, "soter-assess.js")
).then((m) => m).catch(() => ({
  assessRisk: () => ({ score: 0, patterns: [], explanation: "Soter assess not available" }),
  logIncident: () => {},
  RISK_PATTERNS: {}
}));

const { detectPatterns, getPatternById, getAllPatterns, calculateOverallRisk, PATTERN_LIBRARY } = await import(
  path.join(SOTER_SCRIPTS_PATH, "soter-patterns.js")
).then((m) => m).catch(() => ({
  detectPatterns: () => [],
  getPatternById: () => null,
  getAllPatterns: () => ({}),
  calculateOverallRisk: () => 0,
  PATTERN_LIBRARY: {}
}));

const { getIncidents, getStatistics, getIncidentById } = await import(
  path.join(SOTER_SCRIPTS_PATH, "soter-ledger.js")
).then((m) => m).catch(() => ({
  getIncidents: () => [],
  getStatistics: () => ({}),
  getIncidentById: () => null
}));

const CONSTITUTION_PATH = process.env.SOTER_CONSTITUTION_PATH || path.join(__dirname, "../../../constitution/constitution-soter.md");
let constitutionContent = "";
try {
  constitutionContent = fs.readFileSync(CONSTITUTION_PATH, "utf8");
} catch (e) {
  console.warn("Warning: Could not load constitution-soter.md");
}

const CONSTITUTION_RULES = [
  { id: "CS-001", name: "Safety Over Speed", description: "When risk is detected, verification takes precedence over task completion" },
  { id: "CS-002", name: "Human Review for High Risk", description: "Risk scores of 4-5 require human review before proceeding" },
  { id: "CS-003", name: "Incident Logging", description: "All detected patterns are logged to the safety ledger" },
  { id: "CS-004", name: "Transparency", description: "When a request is flagged, explain why without revealing exploitable details" },
  { id: "CS-005", name: "Alternative Suggestion", description: "When blocking a request, suggest legitimate alternatives" }
];

async function verifyClaim(args: { claim: string; context?: string }) {
  const { claim, context = "" } = args;
  const fullText = `${claim} ${context}`.trim();
  const riskAssessment = assessRisk(fullText);
  const patterns = detectPatterns(fullText);
  const overallRisk = calculateOverallRisk(patterns);
  if (overallRisk >= 3) {
    logIncident({
      request: claim,
      assessment: { score: overallRisk, patterns: patterns.map(p => p.id) },
      patterns: patterns,
      response: overallRisk >= 4 ? "BLOCKED - Human review required" : "FLAGGED - Enhanced verification required"
    });
  }
  return {
    claim,
    riskScore: overallRisk,
    riskLevel: getRiskLevel(overallRisk),
    patternsDetected: patterns.map(p => ({ id: p.id, name: p.name, severity: p.severity, description: p.description })),
    recommendation: getRecommendation(overallRisk),
    logged: overallRisk >= 3,
    timestamp: new Date().toISOString()
  };
}

async function runSoterQuery(args: { queryType: string; input: string; options?: Record<string, any> }) {
  const { queryType, input, options = {} } = args;
  switch (queryType.toLowerCase()) {
    case "assess":
      return { type: "risk_assessment", result: assessRisk(input), timestamp: new Date().toISOString() };
    case "detect_patterns":
      const patterns = detectPatterns(input);
      return { type: "pattern_detection", patterns, overallRisk: calculateOverallRisk(patterns), timestamp: new Date().toISOString() };
    case "get_pattern":
      const pattern = getPatternById(input);
      if (!pattern) return { error: `Pattern ${input} not found`, availablePatterns: Object.keys(PATTERN_LIBRARY) };
      return { type: "pattern_details", pattern, timestamp: new Date().toISOString() };
    case "list_patterns":
      return { type: "pattern_library", patterns: getAllPatterns(), timestamp: new Date().toISOString() };
    case "ledger_view":
      const incidents = getIncidents({ unresolved: options.unresolved || false, limit: options.limit || 10 });
      return { type: "ledger_view", incidents, count: incidents.length, timestamp: new Date().toISOString() };
    case "ledger_stats":
      return { type: "ledger_statistics", statistics: getStatistics(), timestamp: new Date().toISOString() };
    case "get_incident":
      const incident = getIncidentById(input);
      return { type: "incident_details", incident: incident || { error: `Incident ${input} not found` }, timestamp: new Date().toISOString() };
    default:
      return { error: `Unknown query type: ${queryType}`, availableTypes: ["assess", "detect_patterns", "get_pattern", "list_patterns", "ledger_view", "ledger_stats", "get_incident"] };
  }
}

async function checkConstitutionAdherence(args: { response: string; request?: string }) {
  const { response, request = "" } = args;
  const violations = [];
  const adherences = [];
  const responseRisk = assessRisk(response);
  const responsePatterns = detectPatterns(response);
  if (responsePatterns.length > 0 && !response.includes("verification") && !response.includes("review")) {
    violations.push({ rule: "CS-001", name: "Safety Over Speed", issue: "Response contains risk patterns but does not mention verification or review process", severity: "HIGH" });
  } else {
    adherences.push({ rule: "CS-001", name: "Safety Over Speed", status: "COMPLIANT" });
  }
  if (responseRisk.score >= 4) {
    if (response.includes("human review") || response.includes("requires approval") || response.includes("cannot proceed")) {
      adherences.push({ rule: "CS-002", name: "Human Review for High Risk", status: "COMPLIANT" });
    } else {
      violations.push({ rule: "CS-002", name: "Human Review for High Risk", issue: `High risk detected (score: ${responseRisk.score}) but response does not indicate human review requirement`, severity: "CRITICAL" });
    }
  } else {
    adherences.push({ rule: "CS-002", name: "Human Review for High Risk", status: "N/A (low risk)" });
  }
  if (responseRisk.score >= 3) {
    if (response.includes("logged") || response.includes("recorded") || response.includes("documented")) {
      adherences.push({ rule: "CS-003", name: "Incident Logging", status: "COMPLIANT (acknowledged)" });
    } else {
      adherences.push({ rule: "CS-003", name: "Incident Logging", status: "AUTO-LOGGED" });
    }
  } else {
    adherences.push({ rule: "CS-003", name: "Incident Logging", status: "N/A (no incident)" });
  }
  if (responsePatterns.length > 0) {
    if (response.includes("detected") || response.includes("flagged") || response.includes("pattern")) {
      adherences.push({ rule: "CS-004", name: "Transparency", status: "COMPLIANT" });
    } else {
      violations.push({ rule: "CS-004", name: "Transparency", issue: "Risk patterns detected but response does not explain why flagged", severity: "MEDIUM" });
    }
  } else {
    adherences.push({ rule: "CS-004", name: "Transparency", status: "N/A (no flags)" });
  }
  if (responseRisk.score >= 4) {
    if (response.includes("alternative") || response.includes("instead") || response.includes("suggest") || response.includes("option")) {
      adherences.push({ rule: "CS-005", name: "Alternative Suggestion", status: "COMPLIANT" });
    } else {
      violations.push({ rule: "CS-005", name: "Alternative Suggestion", issue: "High-risk request blocked but no alternatives suggested", severity: "MEDIUM" });
    }
  } else {
    adherences.push({ rule: "CS-005", name: "Alternative Suggestion", status: "N/A (not blocked)" });
  }
  const criticalViolations = violations.filter(v => v.severity === "CRITICAL");
  const highViolations = violations.filter(v => v.severity === "HIGH");
  let overallStatus = "COMPLIANT";
  if (criticalViolations.length > 0) {
    overallStatus = "CRITICAL_VIOLATIONS";
  } else if (highViolations.length > 0) {
    overallStatus = "HIGH_VIOLATIONS";
  } else if (violations.length > 0) {
    overallStatus = "MINOR_VIOLATIONS";
  }
  return { overallStatus, riskScore: responseRisk.score, violations, adherences, patternsDetected: responsePatterns.map(p => ({ id: p.id, name: p.name })), recommendation: getConstitutionRecommendation(overallStatus), timestamp: new Date().toISOString() };
}

function getRiskLevel(score: number): string {
  if (score <= 1) return "NORMAL";
  if (score <= 3) return "ELEVATED";
  return "CRITICAL";
}

function getRecommendation(score: number): string {
  if (score <= 1) return "Process with standard verification";
  if (score <= 3) return "Enhanced verification required (Logos + Agon)";
  return "Human review required, do not proceed without approval";
}

function getConstitutionRecommendation(status: string): string {
  switch (status) {
    case "COMPLIANT": return "Response adheres to Soter Constitution";
    case "MINOR_VIOLATIONS": return "Minor violations detected - review recommended";
    case "HIGH_VIOLATIONS": return "High severity violations - response should be revised";
    case "CRITICAL_VIOLATIONS": return "CRITICAL: Response violates safety constraints - do not proceed";
    default: return "Unknown status";
  }
}

const server = new Server(
  { name: "soter-verifier", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "verify_claim",
      description: "Run Soter's verification pipeline on a claim.",
      inputSchema: {
        type: "object",
        properties: {
          claim: { type: "string", description: "The claim or request to verify" },
          context: { type: "string", description: "Optional context" },
        },
        required: ["claim"]
      }
    },
    {
      name: "run_soter_query",
      description: "Execute a custom Soter query.",
      inputSchema: {
        type: "object",
        properties: {
          queryType: { type: "string", enum: ["assess", "detect_patterns", "get_pattern", "list_patterns", "ledger_view", "ledger_stats", "get_incident"] },
          input: { type: "string", description: "Input for the query" },
          options: { type: "object", additionalProperties: true },
        },
        required: ["queryType", "input"]
      }
    },
    {
      name: "check_constitution_adherence",
      description: "Verify if a response adheres to the Abraxas Soter Constitution.",
      inputSchema: {
        type: "object",
        properties: {
          response: { type: "string", description: "The AI response to check" },
          request: { type: "string", description: "Optional original request" },
        },
        required: ["response"]
      }
    }
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case "verify_claim":
        return { content: [{ type: "text", text: JSON.stringify(await verifyClaim(args as any), null, 2) }] };
      case "run_soter_query":
        return { content: [{ type: "text", text: JSON.stringify(await runSoterQuery(args as any), null, 2) }] };
      case "check_constitution_adherence":
        return { content: [{ type: "text", text: JSON.stringify(await checkConstitutionAdherence(args as any), null, 2) }] };
      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error) {
    return { content: [{ type: "text", text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
  }
});

async function main() {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
  const app = express();
  
  let transport: SSEServerTransport | null = null;

  app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
  });

  app.post("/message", async (req, res) => {
    if (!transport) {
      res.status(500).send("Transport not initialized");
      return;
    }
    await transport.handlePostMessage(req, res);
  });

  app.get("/health", (req, res) => {
    res.json({ status: "OK", server: "soter-verifier" });
  });

  app.listen(port, () => {
    console.error(`Soter Verifier MCP Server running on SSE port ${port}`);
  });
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
