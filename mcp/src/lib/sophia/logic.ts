import type { AppContext } from "../../context";
import { findMissingFragments } from "../epistemic_atlas";
import { webSearch, synthesize } from "../research";
import { verifyAtoms } from "../logos-verification/logic";
import { createClaim } from "../core";
import { prioritizedFragments } from "../core";
import { theorize, validateTheory } from "../synesis/logic";
import { COLLECTIONS } from "../../storage";

export type GauntletStep = {
  name: string;
  action: (ctx: AppContext, prev: any) => Promise<any>;
};

export type Gauntlet = {
  name: string;
  description: string;
  steps: GauntletStep[];
};

export const GAUNTLETS: Record<string, Gauntlet> = {
  "technical-audit": {
    name: "Technical Audit",
    description: "Identify gaps, research them, verify atoms, and create a claim.",
    steps: [
      {
        name: "Identify Gaps",
        action: async (ctx, prev) => findMissingFragments(ctx.store, prev.beliefId),
      },
      {
        name: "Deep Dive Research",
        action: async (ctx, prev) => {
          const gaps = prev as string[];
          if (!gaps || gaps.length === 0) throw new Error("No gaps found to research");
          const searchResults = await webSearch(gaps[0]!, 10);
          return synthesize("Audit Gap: " + gaps[0], [], searchResults.results || [], "summary");
        },
      },
      {
        name: "Verify Atoms",
        action: async (ctx, prev) => {
          const synthesis = prev as any;
          const atoms = String(synthesis.summary).split(". ").filter(Boolean);
          return verifyAtoms(atoms, ctx.store.collection(COLLECTIONS.resolutions));
        },
      },
      {
        name: "Create Claim",
        action: async (ctx, prev) => {
          const verification = prev as any;
          return createClaim(ctx.store, "Audit verified synthesis", [verification.summary || "void"]);
        },
      },
    ],
  },
  "truth-synthesis": {
    name: "Truth Synthesis",
    description: "Search fragments, theorize a connection, and validate the theory.",
    steps: [
      {
        name: "Search Fragments",
        action: async (ctx, prev) => prioritizedFragments(ctx.store, prev.query || "general truth"),
      },
      {
        name: "Theorize",
        action: async (ctx, prev) => {
          const fragments = prev as any[];
          const ids = fragments.map(f => f._id);
          return theorize(prev.domain || "General", ids, ctx.store.collection(COLLECTIONS.claims), ctx.store.collection("epistemic/theories"));
        },
      },
      {
        name: "Validate Theory",
        action: async (ctx, prev) => {
          const theory = prev as any;
          return validateTheory(theory.id, theory.grounding_ids, ctx.store.collection("epistemic/theories"), ctx.store.collection(COLLECTIONS.claims));
        },
      },
    ],
  },
};

export async function executeGauntlet(gauntletName: string, initialArgs: any, ctx: AppContext) {
  const gauntlet = GAUNTLETS[gauntletName];
  if (!gauntlet) throw new Error(`Gauntlet ${gauntletName} not found`);

  const trace: any[] = [];
  let currentResult = initialArgs;

  for (const step of gauntlet.steps) {
    ctx.log.info(`Executing gauntlet step: ${step.name}`, { gauntlet: gauntletName });
    try {
      currentResult = await step.action(ctx, currentResult);
      trace.push({ step: step.name, status: "ok", result: currentResult });
    } catch (err: any) {
      trace.push({ step: step.name, status: "failed", error: err.message });
      throw new Error(`Gauntlet ${gauntletName} failed at step ${step.name}: ${err.message}`);
    }
  }

  return {
    gauntlet: gauntlet.name,
    finalResult: currentResult,
    trace,
  };
}
