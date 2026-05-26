# Specification: Sovereign Ingestion Loop (The Sovereign Scribe)

## 1. Objective
Transform the Mnemosyne reservoir from a static, manually-populated vault into a living epistemic organism. The **Sovereign Scribe** is an autonomous ingestion loop that identifies, verifies, and integrates high-signal external information into the Sovereign Brain without human intervention, while maintaining a zero-trust security posture.

## 2. The Ingestion Pipeline (The Gauntlet)
Every piece of external data must traverse the **Sovereign Gauntlet** before promotion to the reservoir.

### Phase 1: Sensing (The Sieve)
- **Source Monitors**: Configurable "High-Signal" endpoints (e.g., Academic preprints, Official Documentation, Trusted Expert Feeds).
- **Saliency Trigger**: Uses a modified **Kairos** filter to determine if the incoming data is "Epistemically Novel" or "High Urgency."
- **Noise Reduction**: Strips irrelevant formatting, boilerplate, and low-signal noise.

### Phase 2: Verification (The Gauntlet)
1. **Soter Scan**: Analyzes the source for deceptive patterns, sycophantic bias, or "Truth-Traps." If the risk score $R > 3$, the fragment is discarded.
2. **Episteme Mapping**: Assigns a provenance tag. 
   - `[EXT-Sovereign]`: Verified trusted partner.
   - `[EXT-Public]`: General web source.
   - `[EXT-Expert]`: Domain-specific authority.
3. **Ethos Weighting**: Cross-references the source against the Ethos 5-Tier hierarchy. If the source is T4 or T5 (Unverified), it is marked as `[SKEPTIC]` and requires multi-source consensus before promotion.

### Phase 3: Synthesis & Promotion
- **Fragmentization**: Breaks the verified data into atomic "Truth-Fragments" (Claims).
- **Consensus Check**: If the data is `[SKEPTIC]`, the Scribe searches for corroborating evidence from other high-signal sources.
- **Mnemosyne Commit**: Writes the final fragment to the reservoir with:
    - **Payload**: The atomic truth.
    - **Provenance**: The Episteme tag.
    - **Weight**: The Ethos score.
    - **Timestamp**: The ingestion date.

## 3. Technical Architecture

### 3.1 Component Diagram
`External World` $\to$ `Scribe Sensor` $\to$ `Soter MCP` $\to$ `Episteme MCP` $\to$ `Ethos MCP` $\to$ `Mnemosyne MCP` $\to$ `Reservoir`

### 3.2 API Requirements
- **Ingestion Endpoint**: `POST /ingest` (Triggered by cron or webhook).
- **Audit Log**: `/logs/ingestion.log` (Records every rejected fragment and why).
- **Promotion Guard**: A final check to ensure the new fragment does not contradict a high-weight existing truth (Conflict Resolution).

## 4. Definition of Done (DoD)
- [ ] **Specification Approved**: Technical design finalized.
- [ ] **Scribe MCP Implemented**: Functional MCP server handling the pipeline.
- [ ] **Integration Verified**: Successful flow from External $\to$ Mnemosyne.
- [ ] **Conflict Resolution Test**: System correctly flags and handles contradictory external data.
- [ ] **Benchmark**: Demonstrate the ingestion of $\geq 10$ verified fragments from a target high-signal source.
