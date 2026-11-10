// PEF v2 placeholder scaffold — to be implemented under the dev cycle.
// NEXT VERSION: PEF v2 stronger format + exports + index + viewer.
// Status: NOT STARTED (see /Users/tylergarlick/@Projects/abraxas/NEXT_VERSION.md)

export interface PefV2Fragment {
  id: string;
  content: string;
  provenance_id: string;
  trust_weight: number;
  anchor_root?: string;
  domain?: string;
  tags?: string[];
}

export interface PefV2Edge {
  from: string;
  to: string;
  type: "supports" | "contradicts" | "derived_from" | "superseded_by";
}

export interface PefV2 {
  version: "2.0.0";
  metadata: {
    generator: string;
    generated_at: string;
    claim_id: string;
    constitution_snapshot_hash?: string;
  };
  conclusion?: string;
  fragments: PefV2Fragment[];
  edges: PefV2Edge[];
  seals: Array<{
    type: "cmv" | "keccak" | "truth-net";
    value: string;
    signer?: string;
  }>;
  index: {
    offsets: Record<string, number>;
  };
}

export async function exportPefV2(...args: unknown[]): Promise<PefV2> {
  throw new Error("NOT IMPLEMENTED — NEXT VERSION");
}

export async function importPefV2(...args: unknown[]): Promise<unknown> {
  throw new Error("NOT IMPLEMENTED — NEXT VERSION");
}

export async function exportPefMarkdown(...args: unknown[]): Promise<string> {
  throw new Error("NOT IMPLEMENTED — NEXT VERSION");
}

export async function rebuildPefIndex(...args: unknown[]): Promise<unknown> {
  throw new Error("NOT IMPLEMENTED — NEXT VERSION");
}
