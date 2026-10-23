import { defineTool } from "./helpers";
import { findEpistemicBridges, deriveSovereignTruth } from "../lib/reasoning/pathfinder";
import { generateVerificationProof, verifyExternalProof } from "../lib/nexus/privacy";
import { z } from "zod";

export const researchTools = {
  name: "research_advanced",
  register: (server: any, ctx: any) => {
    defineTool(
      server,
      ctx,
      "find_epistemic_bridges",
      "Find shared fragments between two claims to identify a logical bridge for synthesis.",
      {
        claimAId: z.string(),
        claimBId: z.string(),
      },
      async ({ claimAId, claimBId }) => {
        return findEpistemicBridges(ctx, claimAId, claimBId);
      },
      { readOnly: true }
    );

    defineTool(
      server,
      ctx,
      "derive_sovereign_truth",
      "Perform deterministic path-finding across multiple verified claims to derive a new inferred truth.",
      {
        premises: z.array(z.string()).describe("IDs of verified claims to synthesize"),
      },
      async ({ premises }) => {
        return deriveSovereignTruth(ctx, premises);
      },
      { readOnly: false }
    );

    defineTool(
      server,
      ctx,
      "generate_verification_proof",
      "Generate a privacy-preserving proof of a claim's verification status for sharing without leaking raw data.",
      {
        claimId: z.string(),
        issuer: z.string().default("SovereignBrain"),
      },
      async ({ claimId, issuer }) => {
        return generateVerificationProof(ctx, claimId, issuer);
      },
      { readOnly: true }
    );

    defineTool(
      server,
      ctx,
      "verify_external_proof",
      "Verify a privacy-preserving status proof received from another Nexus node.",
      {
        proof: z.any(),
        expectedStatus: z.string().default("confirmed"),
      },
      async ({ proof, expectedStatus }) => {
        return verifyExternalProof(ctx, proof, expectedStatus);
      },
      { readOnly: true }
    );
  },
};
