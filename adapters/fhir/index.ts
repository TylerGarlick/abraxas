/**
 * FHIR Adapter Module
 * 
 * Main entry point for the FHIR R4 adapter for Abraxas EHR Integration.
 * 
 * @module adapters/fhir
 * @example
 * ```typescript
 * import { FHIRAdapter, EHRSystem } from './adapters/fhir';
 * 
 * const adapter = new FHIRAdapter({ verbose: true });
 * const result = adapter.parse(fhirResource);
 * 
 * if (result.success) {
 *   console.log(`Parsed ${result.resourceType} from ${result.ehrSystem}`);
 * }
 * ```
 */

export {
  // Main adapter
  FHIRAdapter,
  createFHIRAdapter,
  EHRSystem,
  
  // Types
  FHIRAdapterConfig,
  ParseStats,
  AdapterRegistry,
  
  // Provider adapters
  EpicFHIRAdapter,
  CernerFHIRAdapter,
  MeditechFHIRAdapter,
  createEpicAdapter,
  createCernerAdapter,
  createMeditechAdapter,
  
  // Normalized types
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

  // Normalizer utilities
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
} from "./fhir-adapter";
