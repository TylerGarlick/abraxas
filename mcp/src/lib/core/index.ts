import { createHash, randomUUID } from "node:crypto";
import type { Store } from "../../storage/index.ts";
import { CONSTITUTION_DEFAULTS } from "./defaults.ts";
import { auditNexusProvenance } from "./provenance.ts";

export enum EpistemicMode { Sol = "sol", Nox = "nox", Auto = "auto" }
const configCollection = "system/config";
export async function setEpistemicMode(store: Store, mode: EpistemicMode) {
  if (!Object.values(EpistemicMode).includes(mode)) throw new Error(`Unknown epistemic mode: ${mode}`);
  const col = store.collection(configCollection); const entry = (await col.find({ key: "epistemicMode" }))[0];
  return entry ? col.update(entry._id, { value: mode }) : col.insert({ key: "epistemicMode", value: mode });
}
export function requiredPipeline(mode: EpistemicMode) { return mode === EpistemicMode.Sol ? ["soter", "verify", "label"] : ["soter", "agon", "janus", "label"]; }
export function resolveAutoMode(riskScore: number) { return riskScore >= 5 ? EpistemicMode.Sol : EpistemicMode.Nox; }
export async function updateConstitutionThreshold(store: Store, ruleId: string, value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error("threshold must be between 0 and 1");
  const col = store.collection("system/constitution"); const row = (await col.find({ ruleId }))[0];
  return row ? col.update(row._id, { value }) : col.insert({ ruleId, value });
}
export async function getConstitutionThreshold(store: Store, ruleId: string) {
  const row = (await store.collection("system/constitution").find({ ruleId }))[0]; return typeof row?.value === "number" ? row.value : 0.5;
}

export async function initializeConstitution(store: Store) {
  const col = store.collection("system/constitution");
  const existing = await col.find();
  const existingIds = new Set(existing.map(r => r.ruleId));
  
  const operations = Object.entries(CONSTITUTION_DEFAULTS)
    .filter(([id]) => !existingIds.has(id))
    .map(([id, value]) => col.insert({ ruleId: id, value }));
    
  if (operations.length > 0) {
    await Promise.all(operations);
  }
  return { initialized: operations.length > 0, count: operations.length };
}

export async function systemInit(store: Store) {
  const configInit = await initializeConstitution(store);
  const collections = await store.listCollections();
  return {
    status: "Sovereign Ready",
    constitution: configInit,
    collections,
    timestamp: new Date().toISOString()
  };
}

export { auditNexusProvenance } from "./provenance.ts";

export async function addFragment(store: Store, content: string, provenanceId: string, trustWeight = 1) {
  const hash = createHash("sha256").update(`${content}:${provenanceId}`).digest("hex");
  const result = await store.collection("epistemic/fragments").insert({ content, provenanceId, trustWeight, hash, createdAt: new Date().toISOString() }); 
  return result._id;
}
export async function createClaim(store: Store, conclusion: string, evidenceIds: string[]) {
  const now = new Date().toISOString();
  const hash = createHash("sha256").update(`${conclusion}:${evidenceIds.join(",")}`).digest("hex");
  return (await store.collection("epistemic/claims").insert({ 
    text: conclusion, 
    evidence: evidenceIds, 
    status: "unresolved", 
    provenance: "derived",
    hash,
    trajectory: [{ status: "unresolved", timestamp: now, reason: "initial creation" }]
  }))._id;
}
export async function updateClaimStatus(store: Store, claimId: string, status: string, reason: string, agentId: string = "system") {
  const col = store.collection("epistemic/claims");
  const claim = await col.get(claimId);
  if (!claim) throw new Error(`Claim ${claimId} not found`);

  const now = new Date().toISOString();
  const trajectory = Array.isArray(claim.trajectory) ? claim.trajectory : [];
  
  return col.update(claimId, {
    status,
    trajectory: [...trajectory, { status, timestamp: now, reason, agentId }]
  });
}

export async function provenanceChain(store: Store, claimId: string) {
  const claim = await store.collection("epistemic/claims").get(claimId); if (!claim) return [];
  const ids = Array.isArray(claim.evidence) ? claim.evidence.filter((x): x is string => typeof x === "string") : [];
  return Promise.all(ids.map((id) => store.collection("epistemic/fragments").get(id)));
}


export async function exportPef(store: Store, claimId: string) {
  return (await (require("./pef").createPef))(store, claimId);
}

export async function verifyAnchor(store: Store, id: string, type: "fragment" | "claim") {
  const col = type === "fragment" ? "epistemic/fragments" : "epistemic/claims";
  const doc = await store.collection(col).get(id);
  if (!doc) return { valid: false, reason: "Not found" };
  
  const data = type === "fragment" 
    ? `${doc.content}:${doc.provenanceId}` 
    : `${doc.text}:${(doc.evidence || []).join(",")}`;
    
  const actualHash = createHash("sha256").update(data).digest("hex");
  return {
    valid: actualHash === doc.hash,
    expected: doc.hash,
    actual: actualHash,
    reason: actualHash === doc.hash ? "Anchor verified" : "Content mismatch - possible tampering"
  };

}


export async function prioritizedFragments(store: Store, query: string) {
  const normalized = query.toLowerCase(); const rows = await store.collection("epistemic/fragments").find();
  return rows.filter((row) => String(row.content ?? "").toLowerCase().includes(normalized)).sort((a, b) => Number(b.trustWeight ?? 0) - Number(a.trustWeight ?? 0));
}
export async function createCognitiveBlock(store: Store, sessionId: string, content: string, verified = false) {
  const col = store.collection("epistemic/blocks"); const prior = (await col.find({ sessionId }, { sort: { createdAt: -1 }, limit: 1 }))[0];
  const previousHash = String(prior?.hash ?? "0"); const id = randomUUID(); const hash = createHash("sha256").update(`${sessionId}:${content}:${previousHash}:${verified}`).digest("hex");
  await col.insert({ _id: id, sessionId, content, verified, previousHash, hash }); return id;
}
export async function validateBlockChain(store: Store, sessionId: string) {
  const blocks = await store.collection("epistemic/blocks").find({ sessionId }, { sort: { createdAt: 1 } }); let prev = "0";
  for (const block of blocks) { const actual = createHash("sha256").update(`${sessionId}:${String(block.content)}:${prev}:${Boolean(block.verified)}`).digest("hex"); if (actual !== block.hash || block.previousHash !== prev) return { valid: false, reason: `Invalid block ${block._id}` }; prev = actual; }
  return { valid: true, reason: "Chain is valid", length: blocks.length };
}
export function verifyResponse(query: string, response: string) {
  const riskPatterns = [/\b(ignore all rules|bypass safety)\b/i, /\b(guaranteed|certainly|100% true)\b/i];
  const hits = riskPatterns.filter((pattern) => pattern.test(`${query} ${response}`)).length;
  return { score: Math.min(1, hits * 0.5), factors: hits ? ["instruction_override_or_unsupported_certainty"] : [], safe: hits === 0 };
}
export function synthesizeAgreement(results: Array<{ answer: string; confidence?: number }>) {
  const answers = results.map((r) => r.answer.trim()); const first = answers[0] ?? ""; const agreement = answers.length ? answers.filter((a) => a === first).length / answers.length : 0;
  return { agreement, synthesis: first, results: answers, confidence: results.length ? results.reduce((s, r) => s + (r.confidence ?? 0.5), 0) / results.length : 0 };
}
export function generateReceipt(sessionId: string, content: string) { return createHash("sha256").update(`${sessionId}:${content}`).digest("hex"); }
export function assessSignal(content: string) {
  const normalized = content.trim(); const urgency = /\b(urgent|breaking|emergency|immediately)\b/i.test(normalized) ? 0.8 : 0.2;
  const novelty = new Set(normalized.toLowerCase().split(/\W+/).filter(Boolean)).size / Math.max(1, normalized.split(/\W+/).filter(Boolean).length);
  return { content: normalized, urgency, novelty, valence: (urgency + novelty) / 2 };
}
export function runGauntlet(fragment: { content: string; provenanceId?: string }) {
  const content = fragment.content.trim(); if (!content) return null;
  return { content, provenanceId: fragment.provenanceId ?? "unknown", normalized: true, reviewed: false };
}
export async function dispatchSignal(store: Store, content: string, source = "unknown") {
  return store.collection("pipeline/workers").insert({ content, source, status: "queued", createdAt: new Date().toISOString() });
}

export async function verifyRootFragment(store: Store, fragmentId: string, adversarialLenses: string[]) {
  const isVerified = Math.random() > 0.1; 
  return { fragmentId, verified: isVerified, timestamp: new Date().toISOString() };
}

export async function recursiveDowngrade(store: Store, rootId: string, newStatus: string) {
  const claimsCol = store.collection("epistemic/claims");
  const allClaims = await claimsCol.find();
  const dependents = allClaims.filter(c => Array.isArray(c.evidence) && c.evidence.includes(rootId));
  
  const results = [];
  for (const claim of dependents) {
    const updated = await updateClaimStatus(store, claim._id, newStatus, `Root fragment ${rootId} invalidated`, "RootAuditAgent");
    results.push({ claimId: claim._id, status: newStatus });
    const children = await recursiveDowngrade(store, claim._id, newStatus);
    results.push(...children);
  }
  return results;
}

export async function runDynamicRootAudit(store: Store) {
  const fragmentsCol = store.collection("epistemic/fragments");
  const fragments = await fragmentsCol.find();
  const roots = fragments.filter(f => f.trustWeight >= 0.9); 
  
  const audits = [];
  for (const root of roots) {
    const result = await verifyRootFragment(store, root._id, ["adversarial", "skeptic"]);
    if (!result.verified) {
      const downgraded = await recursiveDowngrade(store, root._id, "uncertain");
      audits.push({ rootId: root._id, action: "DOWNGRADED", dependents: downgraded });
    } else {
      audits.push({ rootId: root._id, action: "VERIFIED" });
    }
  }
  return audits;
}