import { AppContext } from "../../context";
import { COLLECTIONS } from "../../storage";
import fs from "node:fs";
import path from "node:path";

export async function loadConstitutionRules(ctx: AppContext) {
  const constitutionDir = path.join(process.cwd(), "constitution");
  const files = fs.readdirSync(constitutionDir).filter(f => f.endsWith(".md"));
  
  const rules: Record<string, string> = {};
  for (const file of files) {
    const content = fs.readFileSync(path.join(constitutionDir, file), "utf-8");
    rules[file] = content;
  }
  return rules;
}

export async function auditLedgerAgainstConstitution(ctx: AppContext) {
  const rules = await loadConstitutionRules(ctx);
  const claimsCol = ctx.store.collection(COLLECTIONS.claims);
  const resolutionsCol = ctx.store.collection(COLLECTIONS.resolutions);
  
  const claims = await claimsCol.find();
  const resolutions = await resolutionsCol.find();
  
  const gapsFound: any[] = [];

  // In a real implementation, this would call an LLM to audit the text against the rules.
  // For the core logic, we implement the "Sovereign Gap" logging mechanism.
  
  for (const claim of claims) {
    // Mock check: if a claim is "confirmed" but has no evidence, that's a gap.
    if (claim.status === "confirmed" && (!claim.evidence || (Array.isArray(claim.evidence) && claim.evidence.length === 0))) {
      const gap = {
        type: "CONSTITUTION_VIOLATION",
        rule: "Rule 1: No Confabulation",
        description: `Claim ${claim._id} is marked confirmed but has no supporting evidence.`,
        severity: "CRITICAL",
        claimId: claim._id
      };
      
      await ctx.store.collection("system/sovereign_gaps").insert(gap);
      gapsFound.push(gap);
    }
  }

  return {
    auditedClaims: claims.length,
    auditedResolutions: resolutions.length,
    gapsFound: gapsFound,
    rulesLoaded: Object.keys(rules).length
  };
}
