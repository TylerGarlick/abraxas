/**
 * Cerner FHIR Adapter
 * 
 * Adapter for Cerner (Oracle Health) EHR system FHIR R4 resources.
 * 
 * Cerner-specific quirks:
 * - Standard FHIR identifiers with CERNER system prefix
 * - May use nested bundles for related resources
 * - Coverage class includes FHIR and MEMBER types
 */

import {
  FhirResource,
  NormalizedIdentifier,
  NormalizedPatient,
  NormalizedClaim,
  NormalizedCoverage,
  ParseResult,
  normalizePatient,
  normalizeClaim,
  normalizeCoverage,
} from "../fhir-normalizer";

export interface CernerAdapterOptions {
  /** Override EHR system identifier */
  ehrSystem?: string;
}

export class CernerFHIRAdapter {
  public readonly ehrSystem = "CERNER";

  // Cerner-specific identifier systems
  private static readonly CERNER_SYSTEMS = {
    mrn: "http://cerner.com/fhir/identifiers/mrn",
    cerner: "urn:oid:2.16.840.1.113883.3.13.6",
    oracle: "http://www.oracle.com/HealthcareOID",
  };

  constructor(private options: CernerAdapterOptions = {}) {}

  /**
   * Detect if this is a Cerner resource.
   * 
   * Cerner indicators:
   * - Identifier with Cerner-specific system URL
   * - Meta.profile containing Cerner
   */
  public detectEhrSystem(resource: FhirResource): string {
    // Check identifiers for Cerner systems
    const identifiers = (resource.identifier as Array<Record<string, unknown>>) || [];
    for (const identifier of identifiers) {
      const system = (identifier.system as string) || "";
      if (
        system.includes("Cerner") ||
        system.toLowerCase().includes("cerner") ||
        system.toLowerCase().includes("oracle")
      ) {
        return this.ehrSystem;
      }
    }

    // Check meta.profile for Cerner
    const profiles = (resource.meta?.profile as string[]) || [];
    for (const profile of profiles) {
      if (profile.includes("Cerner") || profile.includes("Oracle")) {
        return this.ehrSystem;
      }
    }

    // Check for Cerner-specific extensions
    const extensions = (resource.extension as Array<Record<string, unknown>>) || [];
    for (const ext of extensions) {
      const extStr = JSON.stringify(ext);
      if (extStr.includes("Cerner") || extStr.includes("Oracle")) {
        return this.ehrSystem;
      }
    }

    return "UNKNOWN";
  }

  /**
   * Parse identifiers with Cerner-specific logic.
   * 
   * Cerner uses standard FHIR identifiers with CERNER system.
   * May have multiple identifier types.
   */
  public parseIdentifiers(resource: FhirResource): NormalizedIdentifier[] {
    const identifiers: NormalizedIdentifier[] = [];
    const identifierArray = (resource.identifier as Array<Record<string, unknown>>) || [];

    for (const identifier of identifierArray) {
      const system = (identifier.system as string) || "";
      const value = (identifier.value as string) || "";
      const typeDict = (identifier.type as Record<string, unknown>) || {};
      const coding = (typeDict.coding as Array<Record<string, unknown>>) || [];

      // Check for Cerner-specific systems
      const isCerner = Object.values(CernerFHIRAdapter.CERNER_SYSTEMS).some(
        (cernerSys) => system.includes(cernerSys)
      ) || system.includes("Cerner") || system.toLowerCase().includes("cerner");

      if (isCerner) {
        identifiers.push({
          system,
          value,
          typeCode: coding[0]?.code as string,
          typeDisplay: coding[0]?.display as string,
        });
      } else if (system.toLowerCase().includes("mrn") || this.isMrnType(typeDict)) {
        identifiers.push({
          system,
          value,
          typeCode: "MRN",
          typeDisplay: "Medical Record Number",
        });
      } else {
        identifiers.push({
          system,
          value,
          typeCode: coding[0]?.code as string,
          typeDisplay: coding[0]?.display as string,
        });
      }
    }

    return identifiers;
  }

  private isMrnType(typeDict: Record<string, unknown>): boolean {
    const coding = (typeDict.coding as Array<Record<string, unknown>>) || [];
    for (const code of coding) {
      const codeStr = ((code.code as string) || "").toUpperCase();
      const display = ((code.display as string) || "").toLowerCase();
      if (codeStr.includes("MRN") || display.includes("medical record")) {
        return true;
      }
    }
    return false;
  }

  /**
   * Parse a FHIR Patient resource with Cerner-specific handling.
   */
  public parsePatient(resource: FhirResource): ParseResult<NormalizedPatient> {
    const result = normalizePatient(resource, this.ehrSystem);
    if (result.success && result.data) {
      // Add Cerner-specific identifier parsing
      result.data.identifiers = this.parseIdentifiers(resource);
    }
    return result;
  }

  /**
   * Parse a FHIR Claim resource with Cerner-specific handling.
   */
  public parseClaim(resource: FhirResource): ParseResult<NormalizedClaim> {
    const result = normalizeClaim(resource, this.ehrSystem);
    return result;
  }

  /**
   * Parse a FHIR Coverage resource with Cerner-specific handling.
   */
  public parseCoverage(resource: FhirResource): ParseResult<NormalizedCoverage> {
    const result = normalizeCoverage(resource, this.ehrSystem);
    return result;
  }

  /**
   * Parse any FHIR resource.
   * 
   * Detects resource type and delegates to appropriate parser.
   */
  public parse(resource: FhirResource): ParseResult<NormalizedPatient | NormalizedClaim | NormalizedCoverage> {
    const resourceType = resource.resourceType;

    switch (resourceType) {
      case "Patient":
        return this.parsePatient(resource);
      case "Claim":
        return this.parseClaim(resource);
      case "Coverage":
        return this.parseCoverage(resource);
      default:
        return {
          success: false,
          resourceType,
          ehrSystem: this.ehrSystem,
          errors: [`Unsupported resource type: ${resourceType}`],
        };
    }
  }
}

/**
 * Factory function to create Cerner adapter.
 */
export function createCernerAdapter(options?: CernerAdapterOptions): CernerFHIRAdapter {
  return new CernerFHIRAdapter(options);
}
