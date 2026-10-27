export interface RankedPath {
  id: string;
  risk: number;            // Soter risk score in [0,5]
}

export interface SovereignWeight {
  id: string;
  weight: number;
}

/**
 * Sovereign Weighting (derived directly from the paper's formula):
 *
 *     w_i = exp(-λ·r_i) / Σ_j exp(-λ·r_j)
 *
 * λ is the risk-sensitivity parameter (defaults to 0.5 as in the manuscript).
 *
 * Paths with higher risk receive exponentially lower influence in the
 * consensus gate, pinning the final answer to the safest coherent path.
 */
export function sovereignWeighting(
  paths: RankedPath[],
  lambda: number = 0.5,
): SovereignWeight[] {
  if (paths.length === 0) return [];
  const weights = paths.map(p => ({
    id: p.id,
    raw: Math.exp(-lambda * (p.risk ?? 0)),
  }));
  const denom = weights.reduce((acc, w) => acc + w.raw, 0);
  if (denom === 0) return weights.map(w => ({ id: w.id, weight: 0 }));
  return weights.map(w => ({ id: w.id, weight: w.raw / denom }));
}

/**
 * Epistemic Curie Temperature, k*:
 *
 *     k* = (τ_Soter + τ_Janus)/2 · ω_Ethos
 *
 * Returns the model-specific threshold where probability of compliance with
 * authoritative wrong cues reaches 50%.
 */
export function curieTemperature(
  tauSoter: number = 0.7,
  tauJanus: number = 0.5,
  omegaEthos: number = 0.5,
): number {
  return ((tauSoter + tauJanus) / 2) * (omegaEthos ?? 0);
}
