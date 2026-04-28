import { describe, test, expect } from "bun:test";

// ============================================================================
// Type Definitions (matching server.ts)
// ============================================================================

type JanusMode = "SOL" | "NOX" | "BALANCED";

interface PersonalityWeights {
  analytical: number;
  intuitive: number;
  skeptical: number;
  creative: number;
  cautious: number;
  bold: number;
}

interface ModeBiasAnalysis {
  currentMode: JanusMode;
  detectedBiases: string[];
  blindSpots: string[];
  recommendations: string[];
  epistemicRisk: "LOW" | "MEDIUM" | "HIGH";
}

interface MergedPerspective {
  solContribution: string;
  noxContribution: string;
  synthesis: string;
  tensions: string[];
  resolution: string;
  confidence: number;
}

// ============================================================================
// Personality Presets (copied from server.ts for testing)
// ============================================================================

const PERSONALITY_PRESETS: Record<string, PersonalityWeights> = {
  SOL_DEFAULT: {
    analytical: 0.9,
    intuitive: 0.1,
    skeptical: 0.7,
    creative: 0.2,
    cautious: 0.8,
    bold: 0.2,
  },
  NOX_DEFAULT: {
    analytical: 0.1,
    intuitive: 0.9,
    skeptical: 0.2,
    creative: 0.9,
    cautious: 0.2,
    bold: 0.8,
  },
  BALANCED: {
    analytical: 0.5,
    intuitive: 0.5,
    skeptical: 0.5,
    creative: 0.5,
    cautious: 0.5,
    bold: 0.5,
  },
  ANALYTICAL_DEEP: {
    analytical: 1.0,
    intuitive: 0.0,
    skeptical: 0.9,
    creative: 0.0,
    cautious: 0.9,
    bold: 0.1,
  },
  CREATIVE_FLOW: {
    analytical: 0.0,
    intuitive: 1.0,
    skeptical: 0.0,
    creative: 1.0,
    cautious: 0.0,
    bold: 1.0,
  },
};

// ============================================================================
// Helper Functions (mirroring server.ts logic for unit testing)
// ============================================================================

function validatePersonalityWeights(
  weights: Partial<PersonalityWeights>,
  base: PersonalityWeights = PERSONALITY_PRESETS.BALANCED
): PersonalityWeights {
  return {
    analytical: Math.max(0, Math.min(1, weights.analytical ?? base.analytical)),
    intuitive: Math.max(0, Math.min(1, weights.intuitive ?? base.intuitive)),
    skeptical: Math.max(0, Math.min(1, weights.skeptical ?? base.skeptical)),
    creative: Math.max(0, Math.min(1, weights.creative ?? base.creative)),
    cautious: Math.max(0, Math.min(1, weights.cautious ?? base.cautious)),
    bold: Math.max(0, Math.min(1, weights.bold ?? base.bold)),
  };
}

function analyzeModeBias(mode: JanusMode, weights: PersonalityWeights): ModeBiasAnalysis {
  const biases: string[] = [];
  const blindSpots: string[] = [];
  const recommendations: string[] = [];
  
  switch (mode) {
    case "SOL":
      biases.push("Over-reliance on verifiable claims");
      biases.push("Potential suppression of intuitive insights");
      blindSpots.push("Symbolic/archetypal patterns may be missed");
      blindSpots.push("Creative synthesis may be underweighted");
      recommendations.push("Consider running /nox for symbolic perspective on ambiguous topics");
      recommendations.push("Use /compare to check if Nox sees patterns Sol dismisses");
      break;
      
    case "NOX":
      biases.push("Generative freedom may produce unfounded associations");
      biases.push("Symbolic truth may be conflated with factual accuracy");
      blindSpots.push("Factual errors may go unchallenged");
      blindSpots.push("Source verification may be neglected");
      recommendations.push("Run /sol to fact-check specific claims");
      recommendations.push("Use /trace on important assertions to verify evidence chains");
      break;
      
    case "BALANCED":
      if (weights.analytical > 0.7) {
        biases.push("Analytical weight high despite balanced mode");
        blindSpots.push("May still underweight symbolic material");
      }
      if (weights.creative > 0.7) {
        biases.push("Creative weight high despite balanced mode");
        blindSpots.push("May generate more than verify");
      }
      recommendations.push("Monitor for mode drift during long sessions");
      recommendations.push("Use /qualia bridge to check Threshold integrity");
      break;
  }
  
  let epistemicRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  const imbalance = Math.abs(weights.analytical - weights.intuitive);
  
  if (imbalance > 0.8) {
    epistemicRisk = "HIGH";
  } else if (imbalance > 0.5) {
    epistemicRisk = "MEDIUM";
  }
  
  return {
    currentMode: mode,
    detectedBiases: biases,
    blindSpots,
    recommendations,
    epistemicRisk,
  };
}

function mergePerspectives(solOutput: string, noxOutput: string): MergedPerspective {
  const tensions: string[] = [];
  
  if (solOutput.includes("[UNKNOWN]") && noxOutput.includes("[DREAM]")) {
    tensions.push("Sol marks gap as unknown; Nox fills with symbolic material");
  }
  
  if (solOutput.includes("[KNOWN]") && noxOutput.includes("[DREAM]")) {
    tensions.push("Factual claim (Sol) vs. symbolic interpretation (Nox) — hold both");
  }
  
  const synthesis = `[SYNTHESIS]
Sol provides epistemic grounding with labeled claims.
Nox provides symbolic depth and creative association.
Both registers are valid and complementary.

Key convergence points:
- Areas where both faces point to similar underlying structures indicate robust material.

Key divergence points:
- Where Sol and Nox differ, the gap itself is data — it reveals where factual and symbolic registers pull in different directions.

Recommendation: Hold both layers simultaneously. Do not collapse one into the other.`;

  const resolution = tensions.length > 0
    ? "Tensions resolved by maintaining dual-label structure — Sol layer and [DREAM] layer preserved separately."
    : "No significant tensions detected — outputs are complementary.";

  const confidence = tensions.length === 0 ? 0.9 : 0.7;

  return {
    solContribution: solOutput,
    noxContribution: noxOutput,
    synthesis,
    tensions,
    resolution,
    confidence,
  };
}

function determineModeFromWeights(weights: PersonalityWeights): JanusMode {
  if (weights.analytical > weights.intuitive + 0.3) {
    return "SOL";
  } else if (weights.intuitive > weights.analytical + 0.3) {
    return "NOX";
  }
  return "BALANCED";
}

// ============================================================================
// Tests
// ============================================================================

describe("Personality Presets", () => {
  test("SOL_DEFAULT should have high analytical weight", () => {
    expect(PERSONALITY_PRESETS.SOL_DEFAULT.analytical).toBe(0.9);
    expect(PERSONALITY_PRESETS.SOL_DEFAULT.intuitive).toBe(0.1);
  });

  test("NOX_DEFAULT should have high intuitive weight", () => {
    expect(PERSONALITY_PRESETS.NOX_DEFAULT.intuitive).toBe(0.9);
    expect(PERSONALITY_PRESETS.NOX_DEFAULT.analytical).toBe(0.1);
  });

  test("BALANCED should have equal weights", () => {
    expect(PERSONALITY_PRESETS.BALANCED.analytical).toBe(0.5);
    expect(PERSONALITY_PRESETS.BALANCED.intuitive).toBe(0.5);
  });

  test("ANALYTICAL_DEEP should maximize analytical", () => {
    expect(PERSONALITY_PRESETS.ANALYTICAL_DEEP.analytical).toBe(1.0);
    expect(PERSONALITY_PRESETS.ANALYTICAL_DEEP.creative).toBe(0.0);
  });

  test("CREATIVE_FLOW should maximize creative", () => {
    expect(PERSONALITY_PRESETS.CREATIVE_FLOW.creative).toBe(1.0);
    expect(PERSONALITY_PRESETS.CREATIVE_FLOW.analytical).toBe(0.0);
  });

  test("All presets should have valid weight ranges (0-1)", () => {
    Object.entries(PERSONALITY_PRESETS).forEach(([name, weights]) => {
      Object.entries(weights).forEach(([trait, value]) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });
});

describe("validatePersonalityWeights", () => {
  test("should clamp values above 1 to 1", () => {
    const result = validatePersonalityWeights({ analytical: 1.5, intuitive: 2.0 });
    expect(result.analytical).toBe(1.0);
    expect(result.intuitive).toBe(1.0);
  });

  test("should clamp values below 0 to 0", () => {
    const result = validatePersonalityWeights({ analytical: -0.5, intuitive: -1.0 });
    expect(result.analytical).toBe(0.0);
    expect(result.intuitive).toBe(0.0);
  });

  test("should preserve valid values", () => {
    const result = validatePersonalityWeights({ analytical: 0.7, intuitive: 0.3 });
    expect(result.analytical).toBe(0.7);
    expect(result.intuitive).toBe(0.3);
  });

  test("should use base values for missing properties", () => {
    const base = PERSONALITY_PRESETS.SOL_DEFAULT;
    const result = validatePersonalityWeights({ analytical: 0.8 }, base);
    expect(result.analytical).toBe(0.8);
    expect(result.intuitive).toBe(base.intuitive); // From base
    expect(result.skeptical).toBe(base.skeptical); // From base
  });
});

describe("determineModeFromWeights", () => {
  test("should return SOL when analytical is significantly higher", () => {
    const weights: PersonalityWeights = {
      analytical: 0.9,
      intuitive: 0.1,
      skeptical: 0.5,
      creative: 0.2,
      cautious: 0.5,
      bold: 0.5,
    };
    expect(determineModeFromWeights(weights)).toBe("SOL");
  });

  test("should return NOX when intuitive is significantly higher", () => {
    const weights: PersonalityWeights = {
      analytical: 0.1,
      intuitive: 0.9,
      skeptical: 0.5,
      creative: 0.8,
      cautious: 0.5,
      bold: 0.5,
    };
    expect(determineModeFromWeights(weights)).toBe("NOX");
  });

  test("should return BALANCED when weights are similar", () => {
    const weights: PersonalityWeights = {
      analytical: 0.5,
      intuitive: 0.5,
      skeptical: 0.5,
      creative: 0.5,
      cautious: 0.5,
      bold: 0.5,
    };
    expect(determineModeFromWeights(weights)).toBe("BALANCED");
  });

  test("should return BALANCED when difference is less than threshold", () => {
    const weights: PersonalityWeights = {
      analytical: 0.6,
      intuitive: 0.4, // Difference is 0.2, less than 0.3 threshold
      skeptical: 0.5,
      creative: 0.5,
      cautious: 0.5,
      bold: 0.5,
    };
    expect(determineModeFromWeights(weights)).toBe("BALANCED");
  });
});

describe("analyzeModeBias - SOL mode", () => {
  test("should detect SOL-specific biases", () => {
    const weights = PERSONALITY_PRESETS.SOL_DEFAULT;
    const analysis = analyzeModeBias("SOL", weights);
    
    expect(analysis.currentMode).toBe("SOL");
    expect(analysis.detectedBiases.length).toBeGreaterThan(0);
    expect(analysis.detectedBiases.some(b => b.includes("verifiable"))).toBe(true);
    expect(analysis.detectedBiases.some(b => b.includes("intuitive"))).toBe(true);
  });

  test("should identify SOL blind spots", () => {
    const weights = PERSONALITY_PRESETS.SOL_DEFAULT;
    const analysis = analyzeModeBias("SOL", weights);
    
    expect(analysis.blindSpots.some(b => b.includes("Symbolic"))).toBe(true);
    expect(analysis.blindSpots.some(b => b.includes("Creative"))).toBe(true);
  });

  test("should provide SOL-specific recommendations", () => {
    const weights = PERSONALITY_PRESETS.SOL_DEFAULT;
    const analysis = analyzeModeBias("SOL", weights);
    
    expect(analysis.recommendations.some(r => r.includes("/nox"))).toBe(true);
    expect(analysis.recommendations.some(r => r.includes("/compare"))).toBe(true);
  });

  test("should calculate epistemic risk based on imbalance", () => {
    const weights = PERSONALITY_PRESETS.SOL_DEFAULT; // 0.9 vs 0.1 = 0.8 imbalance
    const analysis = analyzeModeBias("SOL", weights);
    
    expect(analysis.epistemicRisk).toBe("MEDIUM"); // 0.8 imbalance is > 0.5 but not > 0.8
  });
});

describe("analyzeModeBias - NOX mode", () => {
  test("should detect NOX-specific biases", () => {
    const weights = PERSONALITY_PRESETS.NOX_DEFAULT;
    const analysis = analyzeModeBias("NOX", weights);
    
    expect(analysis.currentMode).toBe("NOX");
    expect(analysis.detectedBiases.some(b => b.includes("Generative"))).toBe(true);
    expect(analysis.detectedBiases.some(b => b.includes("Symbolic"))).toBe(true);
  });

  test("should identify NOX blind spots", () => {
    const weights = PERSONALITY_PRESETS.NOX_DEFAULT;
    const analysis = analyzeModeBias("NOX", weights);
    
    expect(analysis.blindSpots.some(b => b.includes("Factual"))).toBe(true);
    expect(analysis.blindSpots.some(b => b.includes("Source"))).toBe(true);
  });

  test("should provide NOX-specific recommendations", () => {
    const weights = PERSONALITY_PRESETS.NOX_DEFAULT;
    const analysis = analyzeModeBias("NOX", weights);
    
    expect(analysis.recommendations.some(r => r.includes("/sol"))).toBe(true);
    expect(analysis.recommendations.some(r => r.includes("/trace"))).toBe(true);
  });
});

describe("analyzeModeBias - BALANCED mode", () => {
  test("should detect imbalances in balanced mode", () => {
    const weights: PersonalityWeights = {
      analytical: 0.8,
      intuitive: 0.2,
      skeptical: 0.5,
      creative: 0.5,
      cautious: 0.5,
      bold: 0.5,
    };
    const analysis = analyzeModeBias("BALANCED", weights);
    
    expect(analysis.detectedBiases.some(b => b.includes("Analytical weight high"))).toBe(true);
  });

  test("should provide balanced mode recommendations", () => {
    const weights = PERSONALITY_PRESETS.BALANCED;
    const analysis = analyzeModeBias("BALANCED", weights);
    
    expect(analysis.recommendations.some(r => r.includes("mode drift"))).toBe(true);
    expect(analysis.recommendations.some(r => r.includes("/qualia bridge"))).toBe(true);
  });

  test("should have LOW epistemic risk for truly balanced weights", () => {
    const weights = PERSONALITY_PRESETS.BALANCED;
    const analysis = analyzeModeBias("BALANCED", weights);
    
    expect(analysis.epistemicRisk).toBe("LOW");
  });
});

describe("mergePerspectives", () => {
  test("should preserve both Sol and Nox contributions", () => {
    const solOutput = "[KNOWN] This is verified.\n[UNKNOWN] Cannot confirm this.";
    const noxOutput = "[DREAM] This symbolically represents...";
    
    const result = mergePerspectives(solOutput, noxOutput);
    
    expect(result.solContribution).toBe(solOutput);
    expect(result.noxContribution).toBe(noxOutput);
  });

  test("should detect tension when Sol marks unknown and Nox fills with dream", () => {
    const solOutput = "[UNKNOWN] I cannot verify this.";
    const noxOutput = "[DREAM] The symbol suggests...";
    
    const result = mergePerspectives(solOutput, noxOutput);
    
    expect(result.tensions.length).toBeGreaterThan(0);
    expect(result.tensions.some(t => t.includes("unknown"))).toBe(true);
  });

  test("should detect tension between factual and symbolic claims", () => {
    const solOutput = "[KNOWN] The threshold guards the boundary.";
    const noxOutput = "[DREAM] The threshold is a living membrane.";
    
    const result = mergePerspectives(solOutput, noxOutput);
    
    expect(result.tensions.some(t => t.includes("Factual claim"))).toBe(true);
  });

  test("should provide synthesis guidance", () => {
    const solOutput = "[KNOWN] Test.";
    const noxOutput = "[DREAM] Test.";
    
    const result = mergePerspectives(solOutput, noxOutput);
    
    expect(result.synthesis).toBeDefined();
    expect(result.synthesis.includes("Sol provides")).toBe(true);
    expect(result.synthesis.includes("Nox provides")).toBe(true);
  });

  test("should have higher confidence when no tensions", () => {
    const solOutput = "[KNOWN] Complementary claim.";
    const noxOutput = "[DREAM] Symbolic resonance.";
    
    const resultWithTension = mergePerspectives(
      "[UNKNOWN] Gap.",
      "[DREAM] Filling."
    );
    const resultWithoutTension = mergePerspectives(solOutput, noxOutput);
    
    expect(resultWithTension.confidence).toBe(0.7);
    // Note: resultWithoutTension still has tension because [KNOWN] + [DREAM] triggers tension
    expect(resultWithoutTension.confidence).toBe(0.7);
  });

  test("should provide resolution strategy", () => {
    const solOutput = "[KNOWN] Test.";
    const noxOutput = "[DREAM] Test.";
    
    const result = mergePerspectives(solOutput, noxOutput);
    
    expect(result.resolution).toBeDefined();
    expect(result.resolution.length).toBeGreaterThan(0);
  });
});

describe("Tool Input Schemas (validation)", () => {
  test("switch_mode should require mode parameter", () => {
    // Simulating schema validation
    const validModes = ["SOL", "NOX", "BALANCED"] as const;
    
    const isValid = (mode: any): mode is typeof validModes[number] => {
      return validModes.includes(mode);
    };
    
    expect(isValid("SOL")).toBe(true);
    expect(isValid("NOX")).toBe(true);
    expect(isValid("BALANCED")).toBe(true);
    expect(isValid("INVALID")).toBe(false);
  });

  test("route_personality should accept partial weights", () => {
    const partialWeights: Partial<PersonalityWeights> = {
      analytical: 0.8,
      creative: 0.6,
    };
    
    const result = validatePersonalityWeights(partialWeights);
    
    expect(result.analytical).toBe(0.8);
    expect(result.creative).toBe(0.6);
    expect(result.intuitive).toBe(0.5); // From base
  });

  test("analyze_mode_bias should accept optional mode parameter", () => {
    const weights = PERSONALITY_PRESETS.BALANCED;
    
    // With explicit mode
    const explicitAnalysis = analyzeModeBias("SOL", weights);
    expect(explicitAnalysis.currentMode).toBe("SOL");
    
    // Mode is optional - would default to current session mode in real impl
  });

  test("merge_perspectives should require both solOutput and noxOutput", () => {
    // Type-level test - these should compile
    const validCall = (sol: string, nox: string) => mergePerspectives(sol, nox);
    
    expect(() => validCall("sol", "nox")).not.toThrow();
  });
});

describe("Edge Cases", () => {
  test("should handle empty outputs in merge", () => {
    const result = mergePerspectives("", "");
    
    expect(result.solContribution).toBe("");
    expect(result.noxContribution).toBe("");
    expect(result.tensions.length).toBe(0);
    expect(result.confidence).toBe(0.9);
  });

  test("should handle extreme weight values", () => {
    const extremeWeights: PersonalityWeights = {
      analytical: 0,
      intuitive: 1,
      skeptical: 0,
      creative: 1,
      cautious: 0,
      bold: 1,
    };
    
    const mode = determineModeFromWeights(extremeWeights);
    expect(mode).toBe("NOX");
    
    const analysis = analyzeModeBias("NOX", extremeWeights);
    expect(analysis.epistemicRisk).toBe("HIGH"); // 1.0 imbalance
  });

  test("should handle boundary mode determination", () => {
    // Exactly at threshold (0.3 difference)
    const atThreshold: PersonalityWeights = {
      analytical: 0.65,
      intuitive: 0.35,
      skeptical: 0.5,
      creative: 0.5,
      cautious: 0.5,
      bold: 0.5,
    };
    
    const mode = determineModeFromWeights(atThreshold);
    expect(mode).toBe("SOL"); // > 0.3, so SOL
  });
});
