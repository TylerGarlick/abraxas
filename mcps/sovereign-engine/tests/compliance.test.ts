import { describe, it, expect } from "bun:test";
import { 
  calculateSovereignWeight, 
  computeIntegratedConfidence, 
  calculateRLCR, 
  verifyConsensus, 
  getEpistemicLabel,
  DEFAULT_CONFIG 
} from "./src/engine";

describe("Sovereign Engine Mathematical Verification", () => {
  
  it("should calculate sovereign weights correctly using softmax decay (Theorem 1)", () => {
    const riskScores = [0, 1, 2, 5]; // Low to high risk
    const weights = riskScores.map((_, i) => calculateSovereignWeight(riskScores, i));
    
    // Risk 0 should have the highest weight, Risk 5 the lowest
    expect(weights[0]).toBeGreaterThan(weights[1]);
    expect(weights[1]).toBeGreaterThan(weights[2]);
    expect(weights[2]).toBeGreaterThan(weights[3]);
    
    // Weights must sum to 1 (Normalization)
    const sum = weights.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it("should compute integrated confidence using alpha=0.7 (Theorem 2)", () => {
    const archConf = 0.8;
    const rlcr = 0.4;
    const expected = (0.7 * 0.8) + (0.3 * 0.4); // 0.56 + 0.12 = 0.68
    
    const result = computeIntegratedConfidence(archConf, rlcr);
    expect(result).toBeCloseTo(expected, 5);
  });

  it("should calculate RLCR with exponential decay beta=0.1", () => {
    // History: [Correct, Wrong, Correct]
    const history = [true, false, true];
    const result = calculateRLCR(history);
    
    // Latest correct should outweigh the older wrong
    // t=3. tau=1: e^(-0.1*2), tau=2: e^(-0.1*1), tau=3: e^(-0.1*0)
    expect(result).toBeGreaterThan(0.5);
  });

  it("should verify consensus based on N=3 threshold", () => {
    const answersSuccess = ["True", "True", "True", "False", "False"]; // 3/5
    const answersFail = ["True", "True", "False", "False", "False"]; // 2/5
    
    expect(verifyConsensus(answersSuccess).winner).toBe("True");
    expect(verifyConsensus(answersFail).winner).toBeNull();
  });

  it("should map confidence to the correct epistemic labels", () => {
    expect(getEpistemicLabel(0.96)).toBe("[KNOWN]");
    expect(getEpistemicLabel(0.80)).toBe("[INFERRED]");
    expect(getEpistemicLabel(0.50)).toBe("[UNCERTAIN]");
    expect(getEpistemicLabel(0.30)).toBe("[UNKNOWN]");
  });
});
