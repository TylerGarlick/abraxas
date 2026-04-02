/**
 * FHIR Adapter for Abraxas EHR Integration
 * 
 * Main adapter class that provides a unified interface for parsing
 * FHIR R4 resources from multiple EHR providers (Epic, Cerner, Meditech).
 * 
 * @module adapters/fhir
 */

import {
  FhirResource,
  NormalizedPatient,
  NormalizedClaim,
  NormalizedCoverage,
  NormalizedAllergyIntolerance,
  ParseResult,
  ParseWarnings,
} from "./fhir-normalizer";

import {
  EpicFHIRAdapter,
  createEpicAdapter,
} from "./providers/epic";

import {
  CernerFHIRAdapter,
  createCernerAdapter,
} from "./providers/cerner";

import {
  MeditechFHIRAdapter,
  createMeditechAdapter,
} from "./providers/meditech";

/**
 * Supported EHR systems
 */
export enum EHRSystem {
  EPIC = "EPIC",
  CERNER = "CERNER",
  MEDITECH = "MEDITECH",
  UNKNOWN = "UNKNOWN",
}

/**
 * Adapter registry for EHR systems
 */
export interface AdapterRegistry {
  [key: string]: EpicFHIRAdapter | CernerFHIRAdapter | MeditechFHIRAdapter;
}

/**
 * FHIR Adapter Configuration
 */
export interface FHIRAdapterConfig {
  /** Auto-detect EHR system from resources (default: true) */
  autoDetect?: boolean;
  /** Force specific EHR system */
  forceSystem?: EHRSystem;
  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * Parse statistics for monitoring
 */
export interface ParseStats {
  totalParsed: number;
  successfulParses: number;
  failedParses: number;
  warningsCount: number;
  byResourceType: {
    Patient: number;
    Claim: number;
    Coverage: number;
    AllergyIntolerance: number;
    [key: string]: number;
  };
  byEhrSystem: {
    EPIC: number;
    CERNER: number;
    MEDITECH: number;
    UNKNOWN: number;
  };
}

/**
 * Main FHIR Adapter class
 * 
 * Provides a unified interface for parsing FHIR R4 resources
 * from multiple EHR providers. Automatically detects the EHR system
 * or allows manual specification.
 * 
 * @example
 * ```typescript
 * const adapter = new FHIRAdapter();
 * 
 * // Auto-detect EHR system
 * const result = adapter.parse(patientResource);
 * 
 * // Force specific EHR system
 * const adapter = new FHIRAdapter({ forceSystem: EHRSystem.EPIC });
 * const result = adapter.parse(patientResource);
 * ```
 */
export class FHIRAdapter {
  private config: Required<FHIRAdapterConfig>;
  private stats: ParseStats;
  private adapters: AdapterRegistry;

  constructor(config: FHIRAdapterConfig = {}) {
    this.config = {
      autoDetect: config.autoDetect ?? true,
      forceSystem: config.forceSystem ?? EHRSystem.UNKNOWN,
      verbose: config.verbose ?? false,
    };

    this.stats = {
      totalParsed: 0,
      successfulParses: 0,
      failedParses: 0,
      warningsCount: 0,
      byResourceType: {
        Patient: 0,
        Claim: 0,
        Coverage: 0,
      },
      byEhrSystem: {
        EPIC: 0,
        CERNER: 0,
        MEDITECH: 0,
        UNKNOWN: 0,
      },
    };

    // Initialize provider adapters
    this.adapters = {
      [EHRSystem.EPIC]: createEpicAdapter(),
      [EHRSystem.CERNER]: createCernerAdapter(),
      [EHRSystem.MEDITECH]: createMeditechAdapter(),
    };
  }

  /**
   * Detect EHR system from a FHIR resource.
   * 
   * Tries each provider adapter's detection logic until a match is found.
   * 
   * @param resource - FHIR R4 resource
   * @returns Detected EHR system
   */
  public detectEhrSystem(resource: FhirResource): EHRSystem {
    // Try Epic
    const epicAdapter = this.adapters[EHRSystem.EPIC] as EpicFHIRAdapter;
    if (epicAdapter.detectEhrSystem(resource) === EHRSystem.EPIC) {
      return EHRSystem.EPIC;
    }

    // Try Cerner
    const cernerAdapter = this.adapters[EHRSystem.CERNER] as CernerFHIRAdapter;
    if (cernerAdapter.detectEhrSystem(resource) === EHRSystem.CERNER) {
      return EHRSystem.CERNER;
    }

    // Try Meditech
    const meditechAdapter = this.adapters[EHRSystem.MEDITECH] as MeditechFHIRAdapter;
    if (meditechAdapter.detectEhrSystem(resource) === EHRSystem.MEDITECH) {
      return EHRSystem.MEDITECH;
    }

    return EHRSystem.UNKNOWN;
  }

  /**
   * Get the appropriate adapter for an EHR system.
   * 
   * @param ehrSystem - EHR system identifier
   * @returns Provider-specific adapter
   */
  private getAdapter(ehrSystem: EHRSystem): EpicFHIRAdapter | CernerFHIRAdapter | MeditechFHIRAdapter {
    const adapter = this.adapters[ehrSystem];
    if (!adapter) {
      // Fall back to Epic as default
      return this.adapters[EHRSystem.EPIC];
    }
    return adapter;
  }

  /**
   * Parse a FHIR Patient resource.
   * 
   * @param resource - FHIR Patient resource
   * @param ehrSystem - Optional EHR system (auto-detected if not provided)
   * @returns Parse result with normalized patient data
   */
  public parsePatient(resource: FhirResource, ehrSystem?: EHRSystem): ParseResult<NormalizedPatient> {
    const system = ehrSystem || (this.config.autoDetect ? this.detectEhrSystem(resource) : this.config.forceSystem);
    const adapter = this.getAdapter(system);

    this.stats.totalParsed++;
    this.stats.byResourceType.Patient = (this.stats.byResourceType.Patient || 0) + 1;
    this.stats.byEhrSystem[system] = (this.stats.byEhrSystem[system] || 0) + 1;

    const result = adapter.parsePatient(resource);

    if (result.success) {
      this.stats.successfulParses++;
    } else {
      this.stats.failedParses++;
    }

    if (result.warnings && result.warnings.length > 0) {
      this.stats.warningsCount += result.warnings.length;
    }

    if (this.config.verbose && result.warnings && result.warnings.length > 0) {
      console.log(`[FHIR Adapter] Warnings: ${result.warnings.join(", ")}`);
    }

    return result;
  }

  /**
   * Parse a FHIR Claim resource.
   * 
   * @param resource - FHIR Claim resource
   * @param ehrSystem - Optional EHR system (auto-detected if not provided)
   * @returns Parse result with normalized claim data
   */
  public parseClaim(resource: FhirResource, ehrSystem?: EHRSystem): ParseResult<NormalizedClaim> {
    const system = ehrSystem || (this.config.autoDetect ? this.detectEhrSystem(resource) : this.config.forceSystem);
    const adapter = this.getAdapter(system);

    this.stats.totalParsed++;
    this.stats.byResourceType.Claim = (this.stats.byResourceType.Claim || 0) + 1;
    this.stats.byEhrSystem[system] = (this.stats.byEhrSystem[system] || 0) + 1;

    const result = adapter.parseClaim(resource);

    if (result.success) {
      this.stats.successfulParses++;
    } else {
      this.stats.failedParses++;
    }

    if (result.warnings && result.warnings.length > 0) {
      this.stats.warningsCount += result.warnings.length;
    }

    if (this.config.verbose && result.warnings && result.warnings.length > 0) {
      console.log(`[FHIR Adapter] Warnings: ${result.warnings.join(", ")}`);
    }

    return result;
  }

  /**
   * Parse a FHIR Coverage resource.
   * 
   * @param resource - FHIR Coverage resource
   * @param ehrSystem - Optional EHR system (auto-detected if not provided)
   * @returns Parse result with normalized coverage data
   */
  public parseCoverage(resource: FhirResource, ehrSystem?: EHRSystem): ParseResult<NormalizedCoverage> {
    const system = ehrSystem || (this.config.autoDetect ? this.detectEhrSystem(resource) : this.config.forceSystem);
    const adapter = this.getAdapter(system);

    this.stats.totalParsed++;
    this.stats.byResourceType.Coverage = (this.stats.byResourceType.Coverage || 0) + 1;
    this.stats.byEhrSystem[system] = (this.stats.byEhrSystem[system] || 0) + 1;

    const result = adapter.parseCoverage(resource);

    if (result.success) {
      this.stats.successfulParses++;
    } else {
      this.stats.failedParses++;
    }

    if (result.warnings && result.warnings.length > 0) {
      this.stats.warningsCount += result.warnings.length;
    }

    if (this.config.verbose && result.warnings && result.warnings.length > 0) {
      console.log(`[FHIR Adapter] Warnings: ${result.warnings.join(", ")}`);
    }

    return result;
  }

  /**
   * Parse a FHIR AllergyIntolerance resource
   */
  public parseAllergyIntolerance(
    resource: FhirResource,
    ehrSystem?: EHRSystem
  ): ParseResult<NormalizedAllergyIntolerance> {
    const system = ehrSystem || this.detectEhrSystem(resource);
    const adapter = this.getAdapter(system);

    this.stats.totalParsed++;
    this.stats.byResourceType.AllergyIntolerance = (this.stats.byResourceType.AllergyIntolerance || 0) + 1;
    this.stats.byEhrSystem[system] = (this.stats.byEhrSystem[system] || 0) + 1;

    const result = adapter.parseAllergyIntolerance(resource);

    if (result.success) {
      this.stats.successfulParses++;
    } else {
      this.stats.failedParses++;
    }

    if (result.warnings && result.warnings.length > 0) {
      this.stats.warningsCount += result.warnings.length;
    }

    if (this.config.verbose && result.warnings && result.warnings.length > 0) {
      console.log(`[FHIR Adapter] Warnings: ${result.warnings.join(", ")}`);
    }

    return result;
  }

  /**
   * Parse any FHIR resource.
   *
   * Automatically detects resource type and delegates to appropriate parser.
   *
   * @param resource - FHIR R4 resource (Patient, Claim, Coverage, or AllergyIntolerance)
   * @param ehrSystem - Optional EHR system (auto-detected if not provided)
   * @returns Parse result with normalized data
   */
  public parse(
    resource: FhirResource,
    ehrSystem?: EHRSystem
  ): ParseResult<NormalizedPatient | NormalizedClaim | NormalizedCoverage | NormalizedAllergyIntolerance> {
    const resourceType = resource.resourceType;

    switch (resourceType) {
      case "Patient":
        return this.parsePatient(resource, ehrSystem);
      case "Claim":
        return this.parseClaim(resource, ehrSystem);
      case "Coverage":
        return this.parseCoverage(resource, ehrSystem);
      case "AllergyIntolerance":
        return this.parseAllergyIntolerance(resource, ehrSystem);
      default:
        this.stats.totalParsed++;
        this.stats.failedParses++;
        this.stats.byResourceType[resourceType] = (this.stats.byResourceType[resourceType] || 0) + 1;
        return {
          success: false,
          resourceType,
          ehrSystem: ehrSystem || EHRSystem.UNKNOWN,
          errors: [`Unsupported resource type: ${resourceType}`],
        };
    }
  }

  /**
   * Parse multiple FHIR resources.
   * 
   * @param resources - Array of FHIR R4 resources
   * @param ehrSystem - Optional EHR system (auto-detected per resource if not provided)
   * @returns Array of parse results
   */
  public parseBatch(
    resources: FhirResource[],
    ehrSystem?: EHRSystem
  ): Array<ParseResult<NormalizedPatient | NormalizedClaim | NormalizedCoverage>> {
    return resources.map((resource) => this.parse(resource, ehrSystem));
  }

  /**
   * Get parsing statistics.
   * 
   * @returns Current parse statistics
   */
  public getStats(): ParseStats {
    return { ...this.stats };
  }

  /**
   * Reset parsing statistics.
   */
  public resetStats(): void {
    this.stats = {
      totalParsed: 0,
      successfulParses: 0,
      failedParses: 0,
      warningsCount: 0,
      byResourceType: {
        Patient: 0,
        Claim: 0,
        Coverage: 0,
      },
      byEhrSystem: {
        EPIC: 0,
        CERNER: 0,
        MEDITECH: 0,
        UNKNOWN: 0,
      },
    };
  }
}

/**
 * Create a new FHIR adapter instance.
 * 
 * @param config - Adapter configuration
 * @returns FHIRAdapter instance
 */
export function createFHIRAdapter(config?: FHIRAdapterConfig): FHIRAdapter {
  return new FHIRAdapter(config);
}

// Re-export types and providers for convenience
export {
  FhirResource,
  NormalizedPatient,
  NormalizedClaim,
  NormalizedCoverage,
  NormalizedAllergyIntolerance,
  NormalizedAllergyReaction,
  NormalizedCodeableConcept,
  NormalizedIdentifier,
  NormalizedHumanName,
  NormalizedAddress,
  NormalizedContact,
  NormalizedDiagnosis,
  NormalizedProcedure,
  NormalizedLineItem,
  NormalizedMoney,
  NormalizedCoverageClass,
  ParseResult,
  ParseWarnings,
  normalizePatient,
  normalizeClaim,
  normalizeCoverage,
  normalizeAllergyIntolerance,
  getCode,
  getDisplay,
  getReference,
  parseHumanName,
  parseAddress,
  parseContact,
} from "./fhir-normalizer";

export { EpicFHIRAdapter, createEpicAdapter } from "./providers/epic";
export { CernerFHIRAdapter, createCernerAdapter } from "./providers/cerner";
export { MeditechFHIRAdapter, createMeditechAdapter } from "./providers/meditech";
