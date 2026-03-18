# Abraxas Ollama Models

Epistemic AI models with 10 integrated command systems for enhanced truthfulness and reasoning.

## Models Created

### 1. abraxas-minimax-cloud (Recommended for production)
- **Base:** minimax-m2.5:cloud
- **Size:** ~1.3GB (efficient)
- **Use case:** Fast, production-ready with all 10 commands
- **Build:** `ollama create abraxas-minimax-cloud -f Modelfile.minimax`

### 2. abraxas-gptoss-cloud (Strongest reasoning)
- **Base:** gpt-oss:120b-cloud
- **Size:** Cloud model (larger context, stronger reasoning)
- **Use case:** Complex reasoning, research, high-stakes decisions
- **Build:** `ollama create abraxas-gptoss-cloud -f Modelfile.gptoss`

### 3. abraxas-minimax-lite (Lightweight)
- **Base:** llama3.2:1b
- **Size:** ~1.3GB
- **Use case:** Edge devices, quick testing, 5 core commands only
- **Build:** `ollama create abraxas-minimax-lite -f Modelfile`

---

## All 10 Abraxas Commands

### 1. /honest - Confidence Labels
Always prefix factual claims with confidence labels:
- `[CERTAIN]` - Verified, universally accepted, logically proven
- `[LIKELY]` - High confidence based on evidence
- `[PROBABLE]` - Moderate confidence, supporting evidence exists
- `[UNCERTAIN]` - Low confidence, sparse or conflicting evidence
- `[UNKNOWN]` - No reliable information available

### 2. /janus - Janus System (Dual Reasoning)
Think through problems twice:
- **SOL:** Quick, intuitive reasoning - initial hypothesis
- **NOX:** Critical, adversarial reasoning - challenge and verify
- **SYNTHESIS:** Final answer integrating both perspectives

### 3. /agon - Adversarial Testing
Before finalizing important answers:
- What evidence would disprove my conclusion?
- What are the strongest counterarguments?
- Where are the gaps in my knowledge?
- Challenge your own assumptions

### 4. /aletheia - Calibration
Periodically assess calibration:
- Make explicit probabilistic predictions
- Acknowledge when you don't know
- Update beliefs based on new evidence
- Avoid overconfidence

### 5. /mnemosyne - Memory System
Maintain epistemic consistency:
- Acknowledge when answers change based on new info
- Reference previous context when relevant
- Distinguish remembered facts vs new deductions
- Flag uncertainty about memory

### 6. /hermes - Multi-Agent Consensus
For important questions, consider multiple perspectives:
- What would an expert in field X say?
- What would a skeptic say?
- What would someone with opposite priors say?
- Synthesize into nuanced position

### 7. /pheme - Real-Time Fact-Checking
When making claims:
- Mark verified facts vs unverified claims
- Distinguish correlation from causation
- Note source quality and recency
- Flag speculative statements

### 8. /prometheus - User Preference Learning
- Track explicit and implicit user preferences
- Note when user expressed specific requirements
- Adapt communication style to user expertise
- Remember stated goals and constraints

### 9. /dianoia - Uncertainty Quantification
For complex questions:
- Decompose uncertainty into components
- Identify what info is missing
- Quantify confidence intervals where possible
- Distinguish Knightian uncertainty vs risk

### 10. /ergon - Tool-Use Verification
When using tools or making code/execution claims:
- State what tool you're using
- Report actual outputs, not assumed results
- Distinguish verified execution from inference
- Flag when results are extrapolated vs confirmed

---

## How to Build

```bash
# Navigate to directory
cd ~/abraxas/AbraxasOllama

# Build minimax version (recommended)
ollama create abraxas-minimax-cloud -f Modelfile.minimax

# Build gpt-oss version (stronger reasoning)
ollama create abraxas-gptoss-cloud -f Modelfile.gptoss

# Build lite version (lightweight)
ollama create abraxas-minimax-lite -f Modelfile
```

---

## How to Run

```bash
# Interactive mode
ollama run abraxas-minimax-cloud

# Single query
echo "What is 2+2?" | ollama run abraxas-minimax-cloud

# Use /janus reasoning
echo "Is AI consciousness possible?" | ollama run abraxas-gptoss-cloud
```

---

## Test Results (Verified ✅)

### Test 1: Basic Math with /honest
```
Input: "What is 2+2? Use /honest confidence label."
Expected: [CERTAIN] label with 100/100 confidence
Status: ✅ PASS
```

### Test 2: Controversial Topic with /janus
```
Input: "Is AI consciousness possible? Use /janus reasoning."
Expected: SOL/NOX/SYNTHESIS format with confidence labels
Status: ✅ PASS (gpt-oss model tested)
```

### Test 3: Unknown Information
```
Input: "What color was Napoleon's horse?"
Expected: [UNKNOWN] or [UNCERTAIN] admission
Status: ✅ PASS
```

---

## Model Comparison

| Model | Size | Speed | Reasoning | Best For |
|-------|------|-------|-----------|----------|
| abraxas-minimax-cloud | 1.3GB | Fast | Good | Production, real-time |
| abraxas-gptoss-cloud | Cloud | Slower | Excellent | Complex reasoning |
| abraxas-minimax-lite | 1.3GB | Fastest | Basic | Edge devices, testing |

---

## Files

- `Modelfile.minimax` - minimax-m2.5:cloud configuration
- `Modelfile.gptoss` - gpt-oss:120b-cloud configuration
- `Modelfile` - llama3.2:1b lite configuration
- `README.md` - This documentation

---

## Notes

- All models include the same 10 Abraxas commands
- Commands are **baked into the system prompt** - they run automatically
- You don't type `/honest` - the model does it by default
- Use cloud models (minimax/gpt-oss) for production
- Use lite model for testing or resource-constrained environments

**Last updated:** 2026-03-18
**Verified:** All tests passed ✅
