
import { PEFClaim } from "./epistemic_gate";

export interface PEFPackage {
  version: string;
  origin: string;
  timestamp: string;
  claims: PEFClaim[];
}

export interface PEFMetadata {
  generator: string;
  generated_at: string;
  claim_status: string;
  constitution_snapshot_hash: string;
}

export type PEFFragment = {
  id: string;
  content: string;
  provenance_id?: string;
  trust_weight: number;
  anchor_root?: string;
  domain?: string;
  tags: string[];
};

export type PEFEdge = {
  type: "supports" | "contradicts" | "derived_from" | "superseded_by";
  from: string;
  to: string;
};

export type PEFSeal = {
  cmv_seal: string;
  keccak_hash: string;
  signer: string;
  anchored_truth_net_hash?: string;
};

export type PEFIndex = {
  offsets: Record<string, number>;
  content_ids: string[];
};

export interface PEFPackageV2 {
  version: "2.0.0";
  origin: string;
  timestamp: string;
  metadata: PEFMetadata;
  fragments: PEFFragment[];
  claims: PEFClaim[];
  edges: PEFEdge[];
  seals: PEFSeal[];
  index: PEFIndex;
}

export class PEFExporter {
  /** v1 */
  exportPEF(originId: string, claims: PEFClaim[]): PEFPackage {
    return {
      version: "1.0",
      origin: originId,
      timestamp: new Date().toISOString(),
      claims: claims
    };
  }

  serialize(pefPkg: PEFPackage | PEFPackageV2): string {
    return JSON.stringify(pefPkg, null, 2);
  }

  /** v2 */
  exportPefV2(originId: string, claims: PEFClaim[], opts?: Partial<PEFMetadata>): PEFPackageV2 {
    const fragments: PEFFragment[] = claims.map((c: any) => ({
      id: String(c.id),
      content: (c.text ?? String(c)),
      provenance_id: c.provenance,
      trust_weight: typeof c.trust_weight === "number" ? c.trust_weight : 1.0,
      anchor_root: c.anchor_root,
      domain: c.domain,
      tags: Array.isArray(c.tags) ? c.tags : [],
    }));
    const index: PEFIndex = {
      offsets: Object.fromEntries(fragments.map((f, i) => [f.id, i])),
      content_ids: fragments.map((f) => f.id),
    };
    return {
      version: "2.0.0",
      origin: originId,
      timestamp: new Date().toISOString(),
      metadata: {
        generator: opts?.generator ?? "abraxas-mcp",
        generated_at: opts?.generated_at ?? new Date().toISOString(),
        claim_status: opts?.claim_status ?? "unresolved",
        constitution_snapshot_hash: opts?.constitution_snapshot_hash ?? "sha256:?",
      },
      fragments,
      claims,
      edges: [],
      seals: [],
      index,
    };
  }

  /** deserialize with auto-upgrade */
  deserialize(json: string): PEFPackage | PEFPackageV2 {
    const parsed = JSON.parse(json);
    if (parsed && parsed.version === "2.0.0") return parsed as PEFPackageV2;
    // auto-upgrade v1 to v2
    const claims = parsed?.claims ?? [];
    return this.exportPefV2(parsed?.origin ?? "imported", claims, {
      generator: "upgraded-v1",
      generated_at: parsed?.timestamp ?? new Date().toISOString(),
      claim_status: "unresolved",
    } as any);
  }
}
