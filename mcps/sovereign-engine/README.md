# Sovereign Engine MCP Server

The Sovereign Engine is the deterministic mathematical core of the Abraxas system. It implements the formal specifications derived in the Nature Machine Intelligence and NeurIPS 2026 research papers to ensure that AI confidence and consensus are grounded in architectural determinism rather than probabilistic guessing.

## Mathematical Core
This server implements the following formalisms:
- **Sovereign Weighting**: $\exp(-\lambda R)$ softmax transformation for risk-weighted voting.
- **Integrated Confidence**: $\alpha \cdot C_{\text{arch}} + (1 - \alpha) \cdot \gamma_{\text{RLCR}}$ blending of structural and historical signals.
- **RLCR Tracking**: Exponential decay kernel ($\beta=0.1$) for historical accuracy.
- **Consensus Verification**: Hard-threshold agreement ($N=3$ of $M=5$) for claim emission.
- **Epistemic Labeling**: Deterministic mapping of final confidence to labels: `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`.

## Integration with Abraxas

### 1. Interaction with Skills
The Sovereign Engine serves as the "Judge" for the following skills:
- **Janus System**: Uses the Engine to weight Sol and Nox perspectives and calculate the final epistemic label of a synthesis.
- **Abraxas Oneironautics**: Uses the Engine to calibrate the confidence of symbolic integrations and shadow audits.
- **Soter Verifier**: Feeds risk-scores ($R$) into the Engine to determine the "vote power" of a specific reasoning path.

### 2. Workflow Sequence (The Forward Pass)
1. **Path Generation**: `janus-orchestrator` spawns $M=5$ paths.
2. **Risk Audit**: `soter-verifier` assigns risk-scores ($R$) to each path.
3. **Weighting**: `sovereign-engine` calculates weights $w_i$ using $\lambda=0.5$.
4. **Consensus**: `sovereign-engine` identifies the winning claim $A^*$ via weighted vote.
5. **Confidence Calibration**: `sovereign-engine` blends $C_{\text{arch}}$ and $\gamma_{\text{RLCR}}$ using $\alpha=0.7$.
6. **Labeling**: Result is tagged with an epistemic label (e.g., `[INFERRED]`).

## Usage

### Installation
```bash
cd mcps/sovereign-engine
bun install
```

### Running Tests
To verify mathematical compliance:
```bash
bun test tests/compliance.test.ts
```

### API Reference
- `calculateSovereignWeight(riskScores, targetIndex)`: Returns the normalized weight for a path.
- `computeIntegratedConfidence(archConf, rlcrScore)`: Returns the blended final confidence.
- `verifyConsensus(answers)`: Returns the winner if the $N=3$ threshold is met.
- `getEpistemicLabel(confidence)`: Returns the standard Abraxas epistemic tag.
