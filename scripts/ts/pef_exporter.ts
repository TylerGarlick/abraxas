
import { PEFClaim } from "./epistemic_gate";

export interface PEFPackage {
  version: string;
  origin: string;
  timestamp: string;
  claims: PEFClaim[];
}

export class PEFExporter {
  /**
   * Packages a set of claims into a Portable Epistemic Frame (PEF).
   */
  exportPEF(originId: string, claims: PEFClaim[]): PEFPackage {
    return {
      version: "1.0",
      origin: originId,
      timestamp: new Date().toISOString(),
      claims: claims
    };
  }

  /**
   * Serializes a PEF to a JSON string for transmission.
   */
  serialize(pefPkg: PEFPackage): string {
    return JSON.stringify(pefPkg, null, 2);
  }

  /**
   * Deserializes a PEF string back into a package.
   */
  deserialize(json: string): PEFPackage {
    return JSON.parse(json);
  }
}
