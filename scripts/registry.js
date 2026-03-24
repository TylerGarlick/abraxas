/**
 * Skill Registry
 * Maps phrases to skills for intent routing
 * 
 * To add a new skill:
 * 1. Add entry to REGISTRY object
 * 2. Include all trigger phrases
 * 3. Point to skill location
 */

const REGISTRY = {
  briefing: {
    phrases: [
      "morning briefing",
      "evening briefing",
      "MJ news",
      "generate briefing"
    ],
    description: "Generates daily briefings with AI news, tech news, and weather",
    location: "/home/ubuntu/.openclaw/skills/briefing/"
  },

  "biz-ops": {
    phrases: [
      "MJ analyze opportunities",
      "MJ biz plan",
      "opportunity analysis",
      "analyze briefings"
    ],
    description: "Analyzes research briefings for business opportunities",
    location: "/home/ubuntu/.openclaw/skills/biz-ops/"
  },

  "github-factory": {
    phrases: [
      "check github",
      "MJ github",
      "github activity",
      "check my repos",
      "commit history",
      "github projects"
    ],
    description: "GitHub monitoring and project tracking",
    location: "/home/ubuntu/.openclaw/skills/github-factory/"
  },

  "market-research": {
    phrases: [
      "market research",
      "research market",
      "MJ market",
      "market analysis",
      "competitor analysis",
      "industry trends",
      "MJ research market"
    ],
    description: "Market research and competitive analysis",
    location: "/home/ubuntu/.openclaw/skills/market-research/"
  },

  "mission-control": {
    phrases: [
      "MJ build",
      "MJ, research",
      "MJ, write",
      "MJ, retro",
      "MJ, do",
      "mission control"
    ],
    description: "Task orchestration and subagent factory system",
    location: "/home/ubuntu/.openclaw/skills/mission-control/"
  },

  healthcheck: {
    phrases: [
      "security audit",
      "harden",
      "health check",
      "host security"
    ],
    description: "Host security hardening and risk-tolerance configuration",
    location: "/home/ubuntu/.openclaw/skills/healthcheck/"
  },

  "node-connect": {
    phrases: [
      "connect phone",
      "pairing failed",
      "node connect"
    ],
    description: "Diagnoses OpenClaw node connection and pairing failures",
    location: "/home/ubuntu/.openclaw/skills/node-connect/"
  },

  weather: {
    phrases: [
      "weather",
      "temperature",
      "forecast"
    ],
    description: "Gets current weather and forecasts",
    location: "/home/ubuntu/.openclaw/skills/weather/"
  },

  "skill-router": {
    phrases: [
      "which skill",
      "route this",
      "what should I use",
      "MJ route"
    ],
    description: "Routes intents to the best available skill",
    location: "/home/ubuntu/.openclaw/skills/skill-router/"
  },

  "secrets-manager": {
    phrases: [
      "MJ add secret",
      "MJ rotate secret",
      "secrets manager"
    ],
    description: "Manages encrypted secrets and API keys",
    location: "/home/ubuntu/.openclaw/skills/secrets-manager/"
  },

  "task-verifier": {
    phrases: [
      "verify task",
      "MJ verify",
      "is task done",
      "task complete"
    ],
    description: "Verifies tasks are truly complete",
    location: "/home/ubuntu/.openclaw/skills/task-verifier/"
  },

  "subagent-manager": {
    phrases: [
      "MJ check subagents",
      "stale subagents",
      "subagent status"
    ],
    description: "Manages, monitors, and maintains subagents",
    location: "/home/ubuntu/.openclaw/skills/subagent-manager/"
  },

  "gh-issues": {
    phrases: [
      "GitHub issues",
      "fix bug",
      "open PR"
    ],
    description: "Fetches GitHub issues and creates PRs for fixes",
    location: "/home/ubuntu/.openclaw/skills/gh-issues/"
  },

  github: {
    phrases: [
      "GitHub",
      "PR",
      "CI",
      "repo"
    ],
    description: "GitHub operations via gh CLI",
    location: "/home/ubuntu/.openclaw/skills/github/"
  },

  "skill-creator": {
    phrases: [
      "create a skill",
      "author a skill",
      "improve this skill"
    ],
    description: "Creates and improves AgentSkills",
    location: "/home/ubuntu/.openclaw/skills/skill-creator/"
  },

  "repo-bootstrap": {
    phrases: [
      "bootstrap this repo",
      "make it clone-and-setup",
      "repo-ify"
    ],
    description: "Adds bootstrap system to repositories",
    location: "/home/ubuntu/.openclaw/skills/repo-bootstrap/"
  },

  "repo-recovery": {
    phrases: [
      "reset repo",
      "save repo before reset",
      "repo-recovery"
    ],
    description: "Preserves files before repository reset",
    location: "/home/ubuntu/.openclaw/skills/repo-recovery/"
  },

  "retrospective-enforcer": {
    phrases: [
      "retro",
      "lessons learned"
    ],
    description: "Generates retrospectives and logs lessons",
    location: "/home/ubuntu/.openclaw/skills/retrospective-enforcer/"
  }
};

/**
 * Get all registered skills
 * @returns {string[]} Array of skill names
 */
function getRegisteredSkills() {
  return Object.keys(REGISTRY);
}

/**
 * Get skill info by name
 * @param {string} skillName 
 * @returns {object|null}
 */
function getSkill(skillName) {
  return REGISTRY[skillName] || null;
}

/**
 * Get all phrases for a skill
 * @param {string} skillName
 * @returns {string[]}
 */
function getPhrases(skillName) {
  return REGISTRY[skillName]?.phrases || [];
}

module.exports = {
  REGISTRY,
  getRegisteredSkills,
  getSkill,
  getPhrases
};
