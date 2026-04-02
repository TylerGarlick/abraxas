/**
 * Claim Translator - Abraxas EHR Integration
 * 
 * Translates FHIR ExplanationOfBenefit claims into Abraxas's internal claim format
 * for the logos verification pipeline.
 */

import { Claim, ClaimPatient, ClaimProvider, ClaimDiagnosis, ClaimProcedure, ClaimMedication } from '../types/claim';

export interface AbraxasClaim {
  // Identity
  id: string;                    // Unique claim ID
  source: string;                // "Epic" | "Cerner" | "Meditech"
  receivedAt: Date;              // When claim was ingested

  // Patient
  patient: {
    id: string;
    demographics: {
      age: number;
      gender: string;
    };
  };

  // Provider
  provider: {
    id: string;
    type: "physician" | "facility" | "pharmacy";
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
    date: Date;
  }>;

  medications: Array<{
    code: string;              // RxNorm
    name: string;
    dosage: string;
  }>;

  // Financial
  claimAmount: number;         // Total billed amount
  expectedPayment: number | null;     // Expected reimbursement
  serviceDate: Date;

  // Metadata for verification
  fhirResourceIds: string[];   // Links back to original FHIR resources
  verificationStatus: "pending" | "verified" | "failed";
}

export interface ValidationResult {
  valid: boolean;
  missingFields: string[];
  warnings: string[];
}

export interface ClinicalConcept {
  code: string;
  system: string;
  display: string;
}

export interface ProcedureConcept {
  code: string;
  system: string;
  display: string;
}

/**
 * ClaimTranslator - Converts FHIR claims to Abraxas internal format
 */
export class ClaimTranslator {
  private sourceSystem: string;

  constructor(sourceSystem: string = "Epic") {
    this.sourceSystem = sourceSystem;
  }

  /**
   * Translate a FHIR Claim object to Abraxas internal claim format
   */
  translate(fhirClaim: Claim): AbraxasClaim {
    const now = new Date();

    // Extract patient information
    const patient = this.extractPatient(fhirClaim);
    
    // Extract provider information
    const provider = this.extractProvider(fhirClaim);

    // Extract diagnoses
    const diagnoses = this.extractDiagnoses(fhirClaim);

    // Extract procedures
    const procedures = this.extractProcedures(fhirClaim);

    // Extract medications
    const medications = this.extractMedications(fhirClaim);

    // Extract financial information
    const { claimAmount, expectedPayment, serviceDate } = this.extractFinancials(fhirClaim);

    return {
      id: fhirClaim.id || this.generateClaimId(),
      source: this.sourceSystem,
      receivedAt: now,
      patient,
      provider,
      diagnoses,
      procedures,
      medications,
      claimAmount,
      expectedPayment,
      serviceDate,
      fhirResourceIds: [fhirClaim.id || "unknown"],
      verificationStatus: "pending"
    };
  }

  /**
   * Extract patient information from FHIR claim
   */
  private extractPatient(fhirClaim: Claim): AbraxasClaim["patient"] {
    const patientRef = fhirClaim.patient?.reference || "";
    const patientId = patientRef.replace("Patient/", "");
    
    // Extract demographics from embedded patient resource or defaults
    const patientResource = fhirClaim.patient?.resource;
    const birthDate = patientResource?.birthDate;
    const age = birthDate ? this.calculateAge(birthDate) : 0;
    const gender = patientResource?.gender || "unknown";

    return {
      id: patientId,
      demographics: {
        age,
        gender: gender === "male" ? "M" : gender === "female" ? "F" : "U"
      }
    };
  }

  /**
   * Extract provider information from FHIR claim
   */
  private extractProvider(fhirClaim: Claim): AbraxasClaim["provider"] {
    const providerRef = fhirClaim.provider?.reference || "";
    const providerId = providerRef.replace(/(Practitioner|Organization)\//, "");
    
    // Determine provider type based on reference type or claim context
    let type: "physician" | "facility" | "pharmacy" = "physician";
    if (providerRef.includes("Organization")) {
      type = "facility";
    } else if (providerRef.includes("Pharmacy")) {
      type = "pharmacy";
    }

    return {
      id: providerId,
      type
    };
  }

  /**
   * Extract diagnoses from FHIR claim
   */
  private extractDiagnoses(fhirClaim: Claim): AbraxasClaim["diagnoses"] {
    if (!fhirClaim.diagnosis || fhirClaim.diagnosis.length === 0) {
      return [];
    }

    return fhirClaim.diagnosis.map((diag, index) => {
      const codeableConcept = diag.diagnosisCodeableConcept;
      const code = codeableConcept?.coding?.[0]?.code || "unknown";
      const description = codeableConcept?.coding?.[0]?.display || codeableConcept?.text || "Unknown diagnosis";
      
      // Present on admission flag (default true for outpatient, use POA indicator if available)
      const presentOnAdmission = diag.type?.some(t => t.coding?.some(c => c.code === "POA")) || true;

      return {
        code,
        description,
        presentOnAdmission
      };
    });
  }

  /**
   * Extract procedures from FHIR claim
   */
  private extractProcedures(fhirClaim: Claim): AbraxasClaim["procedures"] {
    if (!fhirClaim.procedure || fhirClaim.procedure.length === 0) {
      return [];
    }

    return fhirClaim.procedure.map((proc) => {
      const codeableConcept = proc.procedureCodeableConcept;
      const code = codeableConcept?.coding?.[0]?.code || "unknown";
      const description = codeableConcept?.coding?.[0]?.display || codeableConcept?.text || "Unknown procedure";
      const date = proc.date ? new Date(proc.date) : new Date();

      return {
        code,
        description,
        date
      };
    });
  }

  /**
   * Extract medications from FHIR claim
   */
  private extractMedications(fhirClaim: Claim): AbraxasClaim["medications"] {
    if (!fhirClaim.medication || fhirClaim.medication.length === 0) {
      return [];
    }

    return fhirClaim.medication.map((med) => {
      const codeableConcept = med.medicationCodeableConcept;
      const code = codeableConcept?.coding?.[0]?.code || "unknown";
      const name = codeableConcept?.coding?.[0]?.display || codeableConcept?.text || "Unknown medication";
      const dosage = med.dosage?.[0]?.text || "As directed";

      return {
        code,
        name,
        dosage
      };
    });
  }

  /**
   * Extract financial information from FHIR claim
   */
  private extractFinancials(fhirClaim: Claim): {
    claimAmount: number;
    expectedPayment: number | null;
    serviceDate: Date;
  } {
    // Extract total claim amount
    const total = fhirClaim.total?.[0]?.amount?.value || 0;
    
    // Expected payment (if available from payer adjudication)
    const expectedPayment = fhirClaim.payment?.amount?.value || null;

    // Service date from item dates or billable period
    let serviceDate = new Date();
    if (fhirClaim.item?.[0]?.servicedDate) {
      serviceDate = new Date(fhirClaim.item[0].servicedDate);
    } else if (fhirClaim.billablePeriod?.start) {
      serviceDate = new Date(fhirClaim.billablePeriod.start);
    }

    return {
      claimAmount: total,
      expectedPayment,
      serviceDate
    };
  }

  /**
   * Map ICD-10 diagnosis code to clinical concept
   */
  mapDiagnosis(code: string): ClinicalConcept {
    // In production, this would lookup against a terminology service
    // For now, return a basic mapping
    return {
      code,
      system: "http://hl7.org/fhir/sid/icd-10",
      display: this.getDiagnosisDisplay(code)
    };
  }

  /**
   * Map CPT procedure code to procedure concept
   */
  mapProcedure(code: string): ProcedureConcept {
    // In production, this would lookup against CPT code set
    return {
      code,
      system: "http://www.ama-assn.org/go/cpt",
      display: this.getProcedureDisplay(code)
    };
  }

  /**
   * Validate an Abraxas claim for completeness
   */
  validate(claim: AbraxasClaim): ValidationResult {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    // Required fields check
    if (!claim.id) missingFields.push("id");
    if (!claim.source) missingFields.push("source");
    if (!claim.receivedAt) missingFields.push("receivedAt");
    if (!claim.patient?.id) missingFields.push("patient.id");
    if (!claim.provider?.id) missingFields.push("provider.id");
    if (!claim.serviceDate) missingFields.push("serviceDate");

    // Clinical content warnings
    if (claim.diagnoses.length === 0) {
      warnings.push("No diagnoses present on claim");
    }
    if (claim.procedures.length === 0 && claim.medications.length === 0) {
      warnings.push("No procedures or medications present on claim");
    }

    // Financial validation
    if (claim.claimAmount <= 0) {
      warnings.push("Claim amount is zero or negative");
    }

    // Demographic warnings
    if (claim.patient.demographics.age === 0) {
      warnings.push("Patient age unknown");
    }

    return {
      valid: missingFields.length === 0,
      missingFields,
      warnings
    };
  }

  /**
   * Helper: Calculate age from birth date string
   */
  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Helper: Generate unique claim ID if not provided
   */
  private generateClaimId(): string {
    return `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper: Get diagnosis display text from code
   */
  private getDiagnosisDisplay(code: string): string {
    // Simplified lookup - in production would use terminology service
    const commonDiagnoses: Record<string, string> = {
      "J06.9": "Acute upper respiratory infection",
      "J18.9": "Pneumonia, unspecified organism",
      "K21.0": "Gastro-esophageal reflux disease with esophagitis",
      "M54.5": "Low back pain",
      "I10": "Essential (primary) hypertension",
      "E11.9": "Type 2 diabetes mellitus without complications"
    };
    return commonDiagnoses[code] || `Diagnosis ${code}`;
  }

  /**
   * Helper: Get procedure display text from code
   */
  private getProcedureDisplay(code: string): string {
    // Simplified lookup - in production would use CPT code set
    const commonProcedures: Record<string, string> = {
      "99213": "Office visit, established patient, low complexity",
      "99214": "Office visit, established patient, moderate complexity",
      "99215": "Office visit, established patient, high complexity",
      "99285": "Emergency department visit, high severity",
      "36415": "Venipuncture, routine",
      "87081": "Culture, bacterial, screening"
    };
    return commonProcedures[code] || `Procedure ${code}`;
  }
}

export default ClaimTranslator;
