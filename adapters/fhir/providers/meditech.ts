/**
 * Meditech FHIR Adapter
 * 
 * Adapter for Meditech EHR system FHIR R4 resources.
 * 
 * Meditech-specific quirks:
 * - Uses Meditech extension system
 * - BARBABANNER custom extension
 * - Identifier patterns differ from standard MRN formats
 */

import {
  FhirResource,
  NormalizedIdentifier,
  NormalizedPatient,
  NormalizedClaim,
  NormalizedCoverage,
  NormalizedAllergyIntolerance,
  ParseResult,
  normalizePatient,
  normalizeClaim,
  normalizeCoverage,
  normalizeAllergyIntolerance,
} from "../fhir-normalizer";

export interface MeditechAdapterOptions {
  /** Override EHR system identifier */
  ehrSystem?: string;
}

export class MeditechFHIRAdapter {
  public readonly ehrSystem = "MEDITECH";

  // Meditech-specific identifier systems
  private static readonly MEDITECH_SYSTEMS = {
    mrn: "http://meditech.com/fhir/identifiers/mrn",
    meditech: "urn:oid:2.16.840.1.113883.3.200",
    barbabanner: "http://meditech.com/fhir/identifiers/barbabanner",
  };

  constructor(private options: MeditechAdapterOptions = {}) {}

  /**
   * Detect if this is a Meditech resource.
   * 
   * Meditech indicators:
   * - Identifier with Meditech-specific system URL
   * - BARBABANNER extension
   * - Meditech-specific extensions
   */
  public detectEhrSystem(resource: FhirResource): string {
    // Check identifiers for Meditech systems
    const identifiers = (resource.identifier as Array<Record<string, unknown>>) || [];
    for (const identifier of identifiers) {
      const system = (identifier.system as string) || "";
      if (
        system.includes("Meditech") ||
        system.toLowerCase().includes("meditech") ||
        system.includes("BARBABANNER")
      ) {
        return this.ehrSystem;
      }
      // Check extensions on identifier
      const extensions = (identifier.extension as Array<Record<string, unknown>>) || [];
      for (const ext of extensions) {
        const extStr = JSON.stringify(ext);
        if (extStr.includes("Meditech") || extStr.includes("BARBABANNER")) {
          return this.ehrSystem;
        }
      }
    }

    // Check for Meditech-specific extensions on resource
    const extensions = (resource.extension as Array<Record<string, unknown>>) || [];
    for (const ext of extensions) {
      const extStr = JSON.stringify(ext);
      if (extStr.includes("Meditech") || extStr.includes("BARBABANNER")) {
        return this.ehrSystem;
      }
    }

    // Check meta.profile for Meditech
    const profiles = (resource.meta?.profile as string[]) || [];
    for (const profile of profiles) {
      if (profile.includes("Meditech")) {
        return this.ehrSystem;
      }
    }

    return "UNKNOWN";
  }

  /**
   * Parse identifiers with Meditech-specific logic.
   * 
   * Meditech uses custom identifier patterns and extensions.
   * BARBABANNER is a common Meditech identifier type.
   */
  public parseIdentifiers(resource: FhirResource): NormalizedIdentifier[] {
    const identifiers: NormalizedIdentifier[] = [];
    const identifierArray = (resource.identifier as Array<Record<string, unknown>>) || [];

    for (const identifier of identifierArray) {
      const system = (identifier.system as string) || "";
      const value = (identifier.value as string) || "";
      const typeDict = (identifier.type as Record<string, unknown>) || {};
      const coding = (typeDict.coding as Array<Record<string, unknown>>) || [];

      // Check for Meditech-specific systems
      const isMeditech = Object.values(MeditechFHIRAdapter.MEDITECH_SYSTEMS).some(
        (meditechSys) => system.includes(meditechSys)
      ) || system.includes("Meditech") || system.includes("BARBABANNER");

      let typeCode = coding[0]?.code as string;
      let typeDisplay = coding[0]?.display as string;

      if (isMeditech) {
        // Check for BARBABANNER in extensions
        if (system.includes("BARBABANNER") || this.hasBarbabannerExtension(identifier)) {
          typeCode = "BARBABANNER";
          typeDisplay = "Meditech BARBABANNER ID";
        }

        identifiers.push({
          system,
          value,
          typeCode,
          typeDisplay,
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
          typeCode,
          typeDisplay,
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

  private hasBarbabannerExtension(identifier: Record<string, unknown>): boolean {
    const extensions = (identifier.extension as Array<Record<string, unknown>>) || [];
    for (const ext of extensions) {
      if (JSON.stringify(ext).includes("BARBABANNER")) {
        return true;
      }
    }
    return false;
  }

  /**
   * Parse a FHIR Patient resource with Meditech-specific handling.
   */
  public parsePatient(resource: FhirResource): ParseResult<NormalizedPatient> {
    const result = normalizePatient(resource, this.ehrSystem);
    if (result.success && result.data) {
      // Add Meditech-specific identifier parsing
      result.data.identifiers = this.parseIdentifiers(resource);
    }
    return result;
  }

  /**
   * Parse a FHIR Claim resource with Meditech-specific handling.
   */
  public parseClaim(resource: FhirResource): ParseResult<NormalizedClaim> {
    const result = normalizeClaim(resource, this.ehrSystem);
    return result;
  }

  /**
   * Parse a FHIR Coverage resource with Meditech-specific handling.
   */
  public parseCoverage(resource: FhirResource): ParseResult<NormalizedCoverage> {
    const result = normalizeCoverage(resource, this.ehrSystem);
    return result;
  }

  /**
   * Parse a FHIR AllergyIntolerance resource with Meditech-specific handling.
   */
  public parseAllergyIntolerance(resource: FhirResource): ParseResult<NormalizedAllergyIntolerance> {
    const result = normalizeAllergyIntolerance(resource, this.ehrSystem);
    return result;
  }

  /**
   * Parse any FHIR resource.
   *
   * Detects resource type and delegates to appropriate parser.
   */
  public parse(resource: FhirResource): ParseResult<NormalizedPatient | NormalizedClaim | NormalizedCoverage | NormalizedAllergyIntolerance> {
    const resourceType = resource.resourceType;

    switch (resourceType) {
      case "Patient":
        return this.parsePatient(resource);
      case "Claim":
        return this.parseClaim(resource);
      case "Coverage":
        return this.parseCoverage(resource);
      case "AllergyIntolerance":
        return this.parseAllergyIntolerance(resource);
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
 * Factory function to create Meditech adapter.
 */
export function createMeditechAdapter(options?: MeditechAdapterOptions): MeditechFHIRAdapter {
  return new MeditechFHIRAdapter(options);
}
