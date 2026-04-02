/**
 * Epic FHIR Adapter
 * 
 * Adapter for Epic EHR system FHIR R4 resources.
 * 
 * Epic-specific quirks:
 * - Uses Epic-specific identifier extensions for MRN
 * - Multiple MRN domains per patient
 * - CUDA extensions for billing
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

export interface EpicAdapterOptions {
  /** Override EHR system identifier */
  ehrSystem?: string;
}

export class EpicFHIRAdapter {
  public readonly ehrSystem = "EPIC";

  // Epic-specific identifier systems
  private static readonly EPIC_SYSTEMS = {
    mrn: "http://Epic.com/fhir/identifiers/mrn",
    epicMrn: "urn:oid:2.16.840.1.113883.3.200",
    cuda: "http://Epic.com/fhir/identifiers/cuda",
    fhir: "http://hl7.org/fhir/sid/us-mrn",
  };

  constructor(private options: EpicAdapterOptions = {}) {}

  /**
   * Detect if this is an Epic resource.
   * 
   * Epic indicators:
   * - Identifier with Epic-specific system URL
   * - Extension containing Epic-specific data
   */
  public detectEhrSystem(resource: FhirResource): string {
    // Check identifiers for Epic systems
    const identifiers = (resource.identifier as Array<Record<string, unknown>>) || [];
    for (const identifier of identifiers) {
      const system = (identifier.system as string) || "";
      if (system.includes("Epic") || system.includes("epic")) {
        return this.ehrSystem;
      }
      // Check extensions
      const extensions = (identifier.extension as Array<Record<string, unknown>>) || [];
      for (const ext of extensions) {
        if (JSON.stringify(ext).includes("Epic")) {
          return this.ehrSystem;
        }
      }
    }

    // Check for Epic-specific extensions on resource
    const extensions = (resource.extension as Array<Record<string, unknown>>) || [];
    for (const ext of extensions) {
      const extStr = JSON.stringify(ext);
      if (extStr.includes("Epic") || extStr.includes("CUDA")) {
        return this.ehrSystem;
      }
    }

    // Check meta.profile for Epic
    const profiles = (resource.meta?.profile as string[]) || [];
    for (const profile of profiles) {
      if (profile.includes("Epic")) {
        return this.ehrSystem;
      }
    }

    return "UNKNOWN";
  }

  /**
   * Parse identifiers with Epic-specific logic.
   * 
   * Epic stores MRN in identifier with extension.
   * May have multiple MRNs in different domains.
   */
  public parseIdentifiers(resource: FhirResource): NormalizedIdentifier[] {
    const identifiers: NormalizedIdentifier[] = [];
    const identifierArray = (resource.identifier as Array<Record<string, unknown>>) || [];

    for (const identifier of identifierArray) {
      const system = (identifier.system as string) || "";
      const value = (identifier.value as string) || "";
      const typeDict = (identifier.type as Record<string, unknown>) || {};
      const coding = (typeDict.coding as Array<Record<string, unknown>>) || [];

      // Check for Epic-specific systems
      const isEpic = Object.values(EpicFHIRAdapter.EPIC_SYSTEMS).some(
        (epicSys) => system.includes(epicSys) || system.includes("Epic") || system.includes("epic")
      );

      if (isEpic) {
        identifiers.push({
          system,
          value,
          typeCode: coding[0]?.code as string,
          typeDisplay: coding[0]?.display as string,
        });
      } else if (system.toLowerCase().includes("mrn") || this.isMrnType(typeDict)) {
        // Standard MRN identifier
        identifiers.push({
          system,
          value,
          typeCode: "MRN",
          typeDisplay: "Medical Record Number",
        });
      } else {
        // Other identifier
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
   * Parse a FHIR Patient resource with Epic-specific handling.
   */
  public parsePatient(resource: FhirResource): ParseResult<NormalizedPatient> {
    const result = normalizePatient(resource, this.ehrSystem);
    if (result.success && result.data) {
      // Add Epic-specific identifier parsing
      result.data.identifiers = this.parseIdentifiers(resource);
    }
    return result;
  }

  /**
   * Parse a FHIR Claim resource with Epic-specific handling.
   */
  public parseClaim(resource: FhirResource): ParseResult<NormalizedClaim> {
    const result = normalizeClaim(resource, this.ehrSystem);
    return result;
  }

  /**
   * Parse a FHIR Coverage resource with Epic-specific handling.
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
 * Factory function to create Epic adapter.
 */
export function createEpicAdapter(options?: EpicAdapterOptions): EpicFHIRAdapter {
  return new EpicFHIRAdapter(options);
}
