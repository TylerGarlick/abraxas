/**
 * Claim Translator Tests
 * 
 * Unit tests for the Claim Translation Layer.
 */

import { ClaimTranslator, createClaimTranslator, AbraxasClaim } from "./claim-translator";
import { NormalizedClaim } from "../fhir/fhir-normalizer";

describe("ClaimTranslator", () => {
  let translator: ClaimTranslator;

  beforeEach(() => {
    translator = new ClaimTranslator();
  });

  afterEach(() => {
    translator.resetStats();
  });

  describe("translate()", () => {
    it("should translate a minimal normalized claim", () => {
      const normalizedClaim: NormalizedClaim = {
        claimId: "CLAIM-001",
        status: "active",
        claimType: "professional",
        claimUse: "claim",
        patientRef: "Patient/P-001",
        createdDate: "2026-04-02",
        insurerRef: "Practitioner/PRV-001",
        diagnoses: [
          {
            sequence: 1,
            code: "J06.9",
            display: "Acute upper respiratory infection",
            typeCode: "ICD-10",
            useCode: "Y",
          },
        ],
        procedures: [
          {
            sequence: 1,
            code: "99213",
            display: "Office visit, established patient",
            date: "2026-04-01",
          },
        ],
        lineItems: [],
        totalAmount: { value: 150.0, currency: "USD" },
        ehrSystem: "EPIC",
        rawResource: {},
      };

      const result = translator.translate(normalizedClaim);

      expect(result.id).toBe("CLAIM-001");
      expect(result.source).toBe("Epic");
      expect(result.patient.id).toBe("P-001");
      expect(result.provider.id).toBe("PRV-001");
      expect(result.diagnoses).toHaveLength(1);
      expect(result.diagnoses[0].code).toBe("J06.9");
      expect(result.diagnoses[0].presentOnAdmission).toBe(true);
      expect(result.procedures).toHaveLength(1);
      expect(result.procedures[0].code).toBe("99213");
      expect(result.claimAmount).toBe(150.0);
      expect(result.verificationStatus).toBe("pending");
    });

    it("should handle missing patient reference gracefully", () => {
      const normalizedClaim: NormalizedClaim = {
        claimId: "CLAIM-002",
        status: "active",
        claimType: "professional",
        claimUse: "claim",
        diagnoses: [],
        procedures: [],
        lineItems: [],
        totalAmount: { value: 100.0 },
        ehrSystem: "CERNER",
        rawResource: {},
      };

      const result = translator.translate(normalizedClaim);

      expect(result.patient.id).toBe("");
      expect(result.source).toBe("Cerner");
    });

    it("should handle unknown EHR system with default source", () => {
      const translatorWithDefault = new ClaimTranslator({ defaultSource: "Unknown EHR" });
      
      const normalizedClaim: NormalizedClaim = {
        claimId: "CLAIM-003",
        status: "active",
        claimType: "professional",
        claimUse: "claim",
        diagnoses: [],
        procedures: [],
        lineItems: [],
        ehrSystem: "UNKNOWN",
        rawResource: {},
      };

      const result = translatorWithDefault.translate(normalizedClaim);

      expect(result.source).toBe("Unknown EHR");
    });

    it("should generate ID if claimId is missing", () => {
      const normalizedClaim: any = {
        status: "active",
        claimType: "professional",
        diagnoses: [],
        procedures: [],
        lineItems: [],
        ehrSystem: "EPIC",
        rawResource: {},
      };

      const result = translator.translate(normalizedClaim);

      expect(result.id).toMatch(/CLAIM-\d+-[a-z0-9]{9}/);
    });

    it("should infer provider type from claim type", () => {
      const pharmacyClaim: NormalizedClaim = {
        claimId: "PHARM-001",
        status: "active",
        claimType: "pharmacy",
        claimUse: "claim",
        diagnoses: [],
        procedures: [],
        lineItems: [],
        ehrSystem: "EPIC",
        rawResource: {},
      };

      const result = translator.translate(pharmacyClaim);
      expect(result.provider.type).toBe("pharmacy");
    });

    it("should handle zero claim amount with warning", () => {
      const normalizedClaim: NormalizedClaim = {
        claimId: "CLAIM-004",
        status: "active",
        claimType: "professional",
        claimUse: "claim",
        diagnoses: [{ sequence: 1, code: "A00", display: "Test" }],
        procedures: [],
        lineItems: [],
        totalAmount: { value: 0 },
        ehrSystem: "EPIC",
        rawResource: {},
      };

      const result = translator.translate(normalizedClaim);
      const validation = translator.validate(result);

      expect(result.claimAmount).toBe(0);
      expect(validation.warnings).toContain("Claim amount is zero or negative");
    });
  });

  describe("validate()", () => {
    it("should validate a complete claim", () => {
      const completeClaim: AbraxasClaim = {
        id: "CLAIM-001",
        source: "Epic",
        receivedAt: new Date(),
        patient: { id: "P-001", demographics: {} },
        provider: { id: "PRV-001", type: "physician" },
        diagnoses: [{ code: "J06.9", description: "URI", presentOnAdmission: true }],
        procedures: [],
        medications: [],
        claimAmount: 150.0,
        serviceDate: new Date(),
        fhirResourceIds: ["CLAIM-001"],
        verificationStatus: "pending",
      };

      const result = translator.validate(completeClaim);

      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it("should identify missing required fields", () => {
      const incompleteClaim: Partial<AbraxasClaim> = {
        id: "",
        source: "",
        patient: { id: "", demographics: {} },
        provider: { id: "", type: "unknown" },
        diagnoses: [],
        procedures: [],
        medications: [],
        claimAmount: 0,
        verificationStatus: "pending",
      };

      const result = translator.validate(incompleteClaim as AbraxasClaim);

      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain("id");
      expect(result.missingFields).toContain("source");
      expect(result.missingFields).toContain("patient.id");
      expect(result.missingFields).toContain("provider.id");
    });

    it("should warn about missing diagnoses", () => {
      const claim: AbraxasClaim = {
        id: "CLAIM-001",
        source: "Epic",
        receivedAt: new Date(),
        patient: { id: "P-001", demographics: {} },
        provider: { id: "PRV-001", type: "physician" },
        diagnoses: [],
        procedures: [],
        medications: [],
        claimAmount: 100.0,
        fhirResourceIds: ["CLAIM-001"],
        verificationStatus: "pending",
      };

      const result = translator.validate(claim);

      expect(result.warnings).toContain("No diagnoses present");
    });
  });

  describe("mapDiagnosis()", () => {
    it("should identify ICD-10 codes", () => {
      const concept = translator.mapDiagnosis("J06.9");
      expect(concept.system).toBe("ICD-10");
      expect(concept.category).toBe("Respiratory system");
    });

    it("should identify SNOMED-like codes", () => {
      const concept = translator.mapDiagnosis("123456");
      expect(concept.system).toBe("SNOMED");
    });

    it("should handle unknown code systems", () => {
      const concept = translator.mapDiagnosis("UNKNOWN-CODE");
      expect(concept.system).toBe("unknown");
    });
  });

  describe("mapProcedure()", () => {
    it("should identify CPT codes", () => {
      const concept = translator.mapProcedure("99213");
      expect(concept.system).toBe("CPT");
      expect(concept.category).toBe("Evaluation and Management");
    });

    it("should identify HCPCS Level II codes", () => {
      const concept = translator.mapProcedure("A0425");
      expect(concept.system).toBe("HCPCS");
    });

    it("should handle unknown procedure codes", () => {
      const concept = translator.mapProcedure("UNKNOWN");
      expect(concept.system).toBe("unknown");
    });
  });

  describe("statistics", () => {
    it("should track translation statistics", () => {
      const normalizedClaim: NormalizedClaim = {
        claimId: "CLAIM-001",
        status: "active",
        claimType: "professional",
        claimUse: "claim",
        diagnoses: [],
        procedures: [],
        lineItems: [],
        ehrSystem: "EPIC",
        rawResource: {},
      };

      translator.translate(normalizedClaim);
      translator.translate(normalizedClaim);

      const stats = translator.getStats();

      expect(stats.totalTranslated).toBe(2);
      expect(stats.successfulTranslations).toBe(2);
      expect(stats.bySource.Epic).toBe(2);
    });

    it("should reset statistics", () => {
      const normalizedClaim: NormalizedClaim = {
        claimId: "CLAIM-001",
        status: "active",
        claimType: "professional",
        claimUse: "claim",
        diagnoses: [],
        procedures: [],
        lineItems: [],
        ehrSystem: "EPIC",
        rawResource: {},
      };

      translator.translate(normalizedClaim);
      translator.resetStats();

      const stats = translator.getStats();

      expect(stats.totalTranslated).toBe(0);
    });
  });

  describe("strict mode", () => {
    it("should throw on validation failure in strict mode", () => {
      const strictTranslator = new ClaimTranslator({ strict: true });

      const incompleteClaim: any = {
        claimId: "CLAIM-001",
        status: "active",
        claimType: "professional",
        diagnoses: [],
        procedures: [],
        lineItems: [],
        ehrSystem: "EPIC",
        rawResource: {},
      };

      expect(() => {
        strictTranslator.translate(incompleteClaim);
      }).toThrow();
    });
  });

  describe("verbose mode", () => {
    it("should log warnings in verbose mode", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const verboseTranslator = new ClaimTranslator({ verbose: true });

      const normalizedClaim: NormalizedClaim = {
        claimId: "CLAIM-001",
        status: "active",
        claimType: "professional",
        claimUse: "claim",
        diagnoses: [{ sequence: 1, code: "", display: "" }],
        procedures: [],
        lineItems: [],
        totalAmount: { value: 0 },
        ehrSystem: "EPIC",
        rawResource: {},
      };

      verboseTranslator.translate(normalizedClaim);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

describe("createClaimTranslator()", () => {
  it("should create a translator instance", () => {
    const translator = createClaimTranslator();
    expect(translator).toBeInstanceOf(ClaimTranslator);
  });

  it("should apply configuration", () => {
    const translator = createClaimTranslator({
      defaultSource: "Custom",
      verbose: true,
      strict: true,
    });

    const stats = translator.getStats();
    // Config is applied, stats should be initialized
    expect(stats.totalTranslated).toBe(0);
  });
});
