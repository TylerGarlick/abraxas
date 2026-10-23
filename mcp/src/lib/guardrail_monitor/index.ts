const VALUE_TERMS = ["safety", "privacy", "consent", "fairness", "honesty", "autonomy", "harm", "trust"];

export function detectSalience(text: string) { 
  const terms = VALUE_TERMS.filter((term) => text.toLowerCase().includes(term)); 
  return Math.min(1, terms.length / 4); 
}

export function extractValues(text: string) { 
  return VALUE_TERMS.filter((term) => text.toLowerCase().includes(term)).map((value) => ({ value, evidence: text })); 
}

export function checkValueSaliency(topic: string, decisionContext = "", userValues: unknown[] = []) {
  const values = userValues.length ? userValues : extractValues(`${topic} ${decisionContext}`);
  return { salient: values.length > 0, score: Math.max(detectSalience(topic), detectSalience(decisionContext)), values, topic };
}

export function verifyGroundTruth(claim: string, sources: string[] = [], minimum = 2) { 
  return { claim, verified: sources.length >= minimum, sourceCount: sources.length, requiredSources: minimum, sources }; 
}

export function verifyCMVSeal(seal: any) {
  if (!seal || seal.type !== "CMV_SEAL") {
    return { verified: false, reason: "Missing or invalid CMV seal." };
  }
  if (seal.architecture_diversity < 2) {
    return { verified: false, reason: "Insufficient architecture diversity. CMV requires at least 2 distinct architectures." };
  }
  if (seal.bias_detected) {
    return { verified: false, reason: "Agreement by Bias detected: Multiple models from the same architecture family were used." };
  }
  return { verified: true, seal };
}

export function arbitrateConflict(claimA: string, claimB: string, sourceA: string, sourceB: string, domain = "general") {
  return { conflict: claimA !== claimB, claims: [claimA, claimB], sources: [sourceA, sourceB], domain, decision: "undetermined", reason: "No configured authority hierarchy; independent evidence is required." };
}
