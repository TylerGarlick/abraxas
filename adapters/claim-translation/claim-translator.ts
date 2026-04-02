/**
 * Claim Translation Layer for Abraxas EHR Integration
 * 
 * Translates normalized FHIR claims from the FHIR Adapter into the
 * internal Abraxas claim format used by the logos verification pipeline.
 * 
 * @module adapters/claim-translation
 */

import { NormalizedClaim, NormalizedPatient, NormalizedCoverage } from "../fhir/fhir-normalizer";

/**
 * Abraxas internal claim format for the logos verification pipeline
 */
export interface AbraxasClaim {
  // Identity
  id: string;                    // Unique claim ID
  source: string;                // "Epic" | "Cerner" | "Meditech"
  receivedAt: Date;              // When claim was ingested

  // Patient
  patient: {
    id: string;
    demographics: {
      age?: number;
      gender?: string;
    };
  };

  // Provider
  provider: {
    id: string;
    type: "physician" | "facility" | "pharmacy" | "unknown";
  };

  // Clinical
  diagnoses: Array<{
    code: string;              // ICD-10 or SNOMED
    description: string;
    presentOnAdmission: boolean;
  }>;

  procedures: Array<{
    code: string;              // CPT or HCPCS
    description: string;
    date?: Date;
  }>;

  medications: Array<{
    code?: string;             // RxNorm
    name: string;
    dosage?: string;
  }>;

  // Financial
  claimAmount: number;         // Total billed amount
  expectedPayment?: number;    // Expected reimbursement
  serviceDate?: Date;

  // Metadata for verification
  fhirResourceIds: string[];   // Links back to original FHIR resources
  verificationStatus: "pending" | "verified" | "failed";
}

/**
 * Validation result for claim translation
 */
export interface ValidationResult {
  valid: boolean;
  missingFields: string[];
  warnings: string[];
}

/**
 * Clinical concept mapping for diagnosis codes
 */
export interface ClinicalConcept {
  code: string;
  system: "ICD-10" | "SNOMED" | "unknown";
  description: string;
  category?: string;
}

/**
 * Procedure concept mapping for CPT/HCPCS codes
 */
export interface ProcedureConcept {
  code: string;
  system: "CPT" | "HCPCS" | "unknown";
  description: string;
  category?: string;
}

/**
 * Raw claim input type (for flexibility)
 */
export type RawClaim = NormalizedClaim | Record<string, unknown>;

/**
 * Claim Translator Configuration
 */
export interface ClaimTranslatorConfig {
  /** Default source system if not specified */
  defaultSource?: string;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Strict mode - fail on missing required fields */
  strict?: boolean;
}

/**
 * Claim Translator Statistics
 */
export interface TranslationStats {
  totalTranslated: number;
  successfulTranslations: number;
  failedTranslations: number;
  warningsCount: number;
  bySource: {
    [key: string]: number;
  };
}

/**
 * Claim Translator Class
 * 
 * Translates FHIR-normalized claims into Abraxas internal format
 * for the logos verification pipeline.
 * 
 * @example
 * ```typescript
 * const translator = new ClaimTranslator();
 * 
 * // Translate a normalized claim
 * const abraxasClaim = translator.translate(normalizedClaim);
 * 
 * // Validate the translation
 * const validation = translator.validate(abraxasClaim);
 * if (!validation.valid) {
 *   console.log("Missing fields:", validation.missingFields);
 * }
 * ```
 */
export class ClaimTranslator {
  private config: Required<ClaimTranslatorConfig>;
  private stats: TranslationStats;

  constructor(config: ClaimTranslatorConfig = {}) {
    this.config = {
      defaultSource: config.defaultSource ?? "UNKNOWN",
      verbose: config.verbose ?? false,
      strict: config.strict ?? false,
    };

    this.stats = {
      totalTranslated: 0,
      successfulTranslations: 0,
      failedTranslations: 0,
      warningsCount: 0,
      bySource: {},
    };
  }

  /**
   * Translate a normalized FHIR claim to Abraxas internal format.
   * 
   * @param claim - Normalized claim from FHIR adapter
   * @returns Translated AbraxasClaim object
   */
  public translate(claim: RawClaim): AbraxasClaim {
    this.stats.totalTranslated++;

    try {
      // Handle both NormalizedClaim and generic record types
      const normalizedClaim = this.asNormalizedClaim(claim);
      
      // Extract source system from EHR system
      const source = this.normalizeSource(normalizedClaim.ehrSystem);
      
      // Build the Abraxas claim
      const abraxasClaim: AbraxasClaim = {
        // Identity
        id: normalizedClaim.claimId || this.generateId(),
        source,
        receivedAt: new Date(),

        // Patient (will be enriched from patient reference if available)
        patient: {
          id: this.extractPatientId(normalizedClaim.patientRef),
          demographics: {
            age: undefined,  // Would need patient lookup
            gender: undefined,
          },
        },

        // Provider
        provider: {
          id: this.extractProviderId(normalizedClaim.insurerRef),
          type: this.inferProviderType(normalizedClaim),
        },

        // Clinical - Diagnoses
        diagnoses: normalizedClaim.diagnoses.map((diag, idx) => ({
          code: diag.code || `UNKNOWN-${idx}`,
          description: diag.display || "Unknown diagnosis",
          presentOnAdmission: this.isPresentOnAdmission(diag),
        })),

        // Clinical - Procedures
        procedures: normalizedClaim.procedures.map((proc) => ({
          code: proc.code || "UNKNOWN",
          description: proc.display || "Unknown procedure",
          date: proc.date ? new Date(proc.date) : undefined,
        })),

        // Clinical - Medications (not typically in Claim resources)
        medications: [],

        // Financial
        claimAmount: normalizedClaim.totalAmount?.value ?? 0,
        expectedPayment: undefined,
        serviceDate: this.extractServiceDate(normalizedClaim),

        // Metadata
        fhirResourceIds: [normalizedClaim.claimId].filter(Boolean),
        verificationStatus: "pending",
      };

      // Validate the translation
      const validation = this.validate(abraxasClaim);
      
      if (!validation.valid && this.config.strict) {
        this.stats.failedTranslations++;
        throw new Error(`Claim translation failed validation: ${validation.missingFields.join(", ")}`);
      }

      if (validation.warnings.length > 0) {
        this.stats.warningsCount += validation.warnings.length;
        if (this.config.verbose) {
          console.log("[Claim Translator] Warnings:", validation.warnings);
        }
      }

      this.stats.successfulTranslations++;
      this.stats.bySource[source] = (this.stats.bySource[source] || 0) + 1;

      return abraxasClaim;
    } catch (error) {
      this.stats.failedTranslations++;
      throw error;
    }
  }

  /**
   * Map ICD-10/SNOMED diagnosis code to clinical concept.
   * 
   * @param code - Diagnosis code
   * @returns Clinical concept with categorization
   */
  public mapDiagnosis(code: string): ClinicalConcept {
    // Basic ICD-10 detection
    const icd10Pattern = /^[A-Z]\d{2}(\.\d{1,4})?$/;
    
    if (icd10Pattern.test(code)) {
      return {
        code,
        system: "ICD-10",
        description: this.getIcd10Category(code),
        category: this.getIcd10Category(code),
      };
    }

    // SNOMED CT codes are typically longer numeric strings
    if (/^\d{6,}$/.test(code)) {
      return {
        code,
        system: "SNOMED",
        description: "SNOMED CT concept",
      };
    }

    return {
      code,
      system: "unknown",
      description: "Unknown code system",
    };
  }

  /**
   * Map CPT/HCPCS procedure code to procedure concept.
   * 
   * @param code - Procedure code
   * @returns Procedure concept with categorization
   */
  public mapProcedure(code: string): ProcedureConcept {
    // CPT codes are 5-digit numeric (sometimes with modifiers)
    const cptPattern = /^\d{5}$/;
    
    if (cptPattern.test(code)) {
      return {
        code,
        system: "CPT",
        description: this.getCptCategory(code),
        category: this.getCptCategory(code),
      };
    }

    // HCPCS Level II codes start with a letter followed by 4 digits
    const hcpcsPattern = /^[A-Z]\d{4}$/;
    
    if (hcpcsPattern.test(code)) {
      return {
        code,
        system: "HCPCS",
        description: "HCPCS Level II code",
      };
    }

    return {
      code,
      system: "unknown",
      description: "Unknown procedure code",
    };
  }

  /**
   * Validate an AbraxasClaim for completeness.
   * 
   * @param claim - AbraxasClaim to validate
   * @returns Validation result with missing fields and warnings
   */
  public validate(claim: AbraxasClaim): ValidationResult {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!claim.id) {
      missingFields.push("id");
    }

    if (!claim.source) {
      missingFields.push("source");
    }

    if (!claim.patient?.id) {
      missingFields.push("patient.id");
    }

    if (!claim.provider?.id) {
      missingFields.push("provider.id");
    }

    if (!claim.diagnoses || claim.diagnoses.length === 0) {
      warnings.push("No diagnoses present");
    }

    // Validate diagnoses
    claim.diagnoses?.forEach((diag, idx) => {
      if (!diag.code) {
        missingFields.push(`diagnoses[${idx}].code`);
      }
      if (!diag.description) {
        warnings.push(`diagnoses[${idx}] missing description`);
      }
    });

    // Validate procedures
    claim.procedures?.forEach((proc, idx) => {
      if (!proc.code || proc.code === "UNKNOWN") {
        warnings.push(`procedures[${idx}] has unknown code`);
      }
    });

    // Financial validation
    if (claim.claimAmount <= 0) {
      warnings.push("Claim amount is zero or negative");
    }

    // Validate service date
    if (!claim.serviceDate) {
      warnings.push("Service date not specified");
    }

    return {
      valid: missingFields.length === 0,
      missingFields,
      warnings,
    };
  }

  /**
   * Get translation statistics.
   * 
   * @returns Current translation statistics
   */
  public getStats(): TranslationStats {
    return { ...this.stats };
  }

  /**
   * Reset translation statistics.
   */
  public resetStats(): void {
    this.stats = {
      totalTranslated: 0,
      successfulTranslations: 0,
      failedTranslations: 0,
      warningsCount: 0,
      bySource: {},
    };
  }

  // ==================== Private Helper Methods ====================

  /**
   * Type guard to check if input is a NormalizedClaim.
   */
  private asNormalizedClaim(claim: RawClaim): NormalizedClaim {
    if (this.isNormalizedClaim(claim)) {
      return claim;
    }
    
    // Try to adapt a generic record to NormalizedClaim structure
    return this.adaptRecordToNormalizedClaim(claim);
  }

  /**
   * Check if input matches NormalizedClaim structure.
   */
  private isNormalizedClaim(claim: RawClaim): claim is NormalizedClaim {
    return (
      typeof claim === "object" &&
      claim !== null &&
      "claimId" in claim &&
      "diagnoses" in claim &&
      "procedures" in claim
    );
  }

  /**
   * Adapt a generic record to NormalizedClaim structure.
   */
  private adaptRecordToNormalizedClaim(record: Record<string, unknown>): NormalizedClaim {
    // Basic adaptation - in production this would be more sophisticated
    return {
      claimId: (record.id || record.claimId) as string || "",
      status: (record.status as string) || "active",
      claimType: (record.claimType as string) || "professional",
      claimUse: (record.claimUse as string) || "claim",
      patientRef: (record.patientId || record.patientRef) as string,
      createdDate: (record.createdDate || record.created) as string,
      insurerRef: (record.providerId || record.insurerRef) as string,
      diagnoses: (record.diagnoses as any[]) || [],
      procedures: (record.procedures as any[]) || [],
      lineItems: (record.lineItems as any[]) || [],
      totalAmount: record.totalAmount as any,
      ehrSystem: (record.ehrSystem || record.source) as string || "UNKNOWN",
      rawResource: record,
    };
  }

  /**
   * Normalize EHR system to source string.
   */
  private normalizeSource(ehrSystem: string): string {
    const sourceMap: Record<string, string> = {
      EPIC: "Epic",
      CERNER: "Cerner",
      MEDITECH: "Meditech",
      UNKNOWN: this.config.defaultSource,
    };

    const normalized = sourceMap[ehrSystem.toUpperCase()];
    return normalized || this.config.defaultSource;
  }

  /**
   * Extract patient ID from patient reference.
   */
  private extractPatientId(patientRef?: string): string {
    if (!patientRef) {
      return "";
    }
    
    // Handle FHIR reference format: "Patient/P-001"
    const parts = patientRef.split("/");
    return parts.length > 1 ? parts[1] : patientRef;
  }

  /**
   * Extract provider ID from insurer/provider reference.
   */
  private extractProviderId(insurerRef?: string): string {
    if (!insurerRef) {
      return "";
    }
    
    // Handle FHIR reference format: "Organization/ORG-001" or "Practitioner/PRV-001"
    const parts = insurerRef.split("/");
    return parts.length > 1 ? parts[1] : insurerRef;
  }

  /**
   * Infer provider type from claim structure.
   */
  private inferProviderType(claim: NormalizedClaim): "physician" | "facility" | "pharmacy" | "unknown" {
    // Simple heuristic based on claim type
    const claimType = claim.claimType?.toLowerCase() || "";
    
    if (claimType.includes("pharmacy") || claimType.includes("drug")) {
      return "pharmacy";
    }
    
    if (claimType.includes("institutional") || claimType.includes("facility")) {
      return "facility";
    }
    
    if (claimType.includes("professional") || claimType.includes("physician")) {
      return "physician";
    }

    // Check procedures for facility indicators
    if (claim.procedures.some(p => p.code?.startsWith("0"))) {
      return "facility";
    }

    return "unknown";
  }

  /**
   * Determine if diagnosis was present on admission.
   */
  private isPresentOnAdmission(diagnosis: { useCode?: string; typeCode?: string }): boolean {
    // POA indicators in FHIR: Y=yes, N=no, U=unknown, W=clinically undetermined
    const poaIndicator = diagnosis.useCode || diagnosis.typeCode;
    
    if (!poaIndicator) {
      return true; // Default to true if not specified
    }
    
    return poaIndicator.toUpperCase() === "Y" || poaIndicator.toUpperCase() === "1";
  }

  /**
   * Extract service date from claim.
   */
  private extractServiceDate(claim: NormalizedClaim): Date | undefined {
    // Try to get date from first procedure
    if (claim.procedures.length > 0 && claim.procedures[0].date) {
      return new Date(claim.procedures[0].date);
    }
    
    // Try created date as fallback
    if (claim.createdDate) {
      return new Date(claim.createdDate);
    }
    
    return undefined;
  }

  /**
   * Generate a unique claim ID if none provided.
   */
  private generateId(): string {
    return `CLAIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get ICD-10 category description (simplified).
   */
  private getIcd10Category(code: string): string {
    const category = code.charAt(0);
    const categories: Record<string, string> = {
      A: "Infectious diseases",
      B: "Infectious diseases",
      C: "Neoplasms",
      D: "Neoplasms",
      E: "Endocrine disorders",
      F: "Mental disorders",
      G: "Nervous system",
      H: "Eye/Ear disorders",
      I: "Circulatory system",
      J: "Respiratory system",
      K: "Digestive system",
      L: "Skin disorders",
      M: "Musculoskeletal",
      N: "Genitourinary",
      O: "Pregnancy/Childbirth",
      P: "Perinatal conditions",
      Q: "Congenital anomalies",
      R: "Symptoms/Signs",
      S: "Injury/Poisoning",
      T: "Injury/Poisoning",
      U: "Emergency codes",
      V: "External causes",
      W: "External causes",
      X: "External causes",
      Y: "External causes",
      Z: "Factors influencing health",
    };
    
    return categories[category] || "Unknown category";
  }

  /**
   * Get CPT category description (simplified).
   */
  private getCptCategory(code: string): string {
    const codeNum = parseInt(code, 10);
    
    if (codeNum >= 99201 && codeNum <= 99499) {
      return "Evaluation and Management";
    }
    if (codeNum >= 10000 && codeNum <= 19999) {
      return "Surgery - Integumentary";
    }
    if (codeNum >= 20000 && codeNum <= 29999) {
      return "Surgery - Musculoskeletal";
    }
    if (codeNum >= 30000 && codeNum <= 39999) {
      return "Surgery - Respiratory/Cardiovascular";
    }
    if (codeNum >= 40000 && codeNum <= 49999) {
      return "Surgery - Digestive";
    }
    if (codeNum >= 50000 && codeNum <= 59999) {
      return "Surgery - Genitourinary";
    }
    if (codeNum >= 60000 && codeNum <= 69999) {
      return "Surgery - Nervous System";
    }
    if (codeNum >= 70000 && codeNum <= 79999) {
      return "Radiology";
    }
    if (codeNum >= 80000 && codeNum <= 89999) {
      return "Pathology and Laboratory";
    }
    if (codeNum >= 90000 && codeNum <= 99999) {
      return "Medicine";
    }
    
    return "Unknown CPT category";
  }
}

/**
 * Create a new Claim Translator instance.
 * 
 * @param config - Translator configuration
 * @returns ClaimTranslator instance
 */
export function createClaimTranslator(config?: ClaimTranslatorConfig): ClaimTranslator {
  return new ClaimTranslator(config);
}
