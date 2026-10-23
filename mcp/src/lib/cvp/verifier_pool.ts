export type ModelArchitecture = 'transformer-gpt' | 'transformer-claude' | 'transformer-llama' | 'transformer-mistral' | 'transformer-gemini' | 'transformer-deepseek' | 'other';

export type VerifierPath = {
  result: any;
  architecture: ModelArchitecture;
  provider: string;
  confidence: number;
};

export const ARCHITECTURE_FAMILIES: Record<ModelArchitecture, string> = {
  'transformer-gpt': 'openai',
  'transformer-claude': 'anthropic',
  'transformer-llama': 'llama-family',
  'transformer-mistral': 'llama-family', // Grouped due to architectural similarities/lineage
  'transformer-gemini': 'google',
  'transformer-deepseek': 'deepseek',
  'other': 'unknown',
};

export class VerifierPool {
  /**
   * Verifies that the consensus is not based on a single architecture or a single architecture family.
   * This prevents common-mode failure where different models based on the same lineage fail in the same way.
   */
  static verifyDiversity(paths: VerifierPath[], requiredArchitectures: number = 2) {
    if (!paths || paths.length === 0) {
      return {
        diverse: false,
        architectureCount: 0,
        familyCount: 0,
        isBiased: false,
        architectures: [],
        families: [],
      };
    }

    const architectures = new Set(paths.map(p => p.architecture));
    const families = new Set(paths.map(p => ARCHITECTURE_FAMILIES[p.architecture]));
    
    const architectureCount = architectures.size;
    const familyCount = families.size;
    
    // Diverse: At least N distinct architectures.
    const diverse = architectureCount >= requiredArchitectures;
    
    // Biased: Multiple architectures are used, but they all belong to the same family.
    // This is the "Agreement by Bias" scenario.
    const isBiased = architectureCount > 1 && familyCount === 1;
    
    return {
      diverse,
      architectureCount,
      familyCount,
      isBiased,
      architectures: Array.from(architectures),
      families: Array.from(families),
    };
  }
}
