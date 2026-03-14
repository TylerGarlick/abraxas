# Abraxas Research Work Items

> Track progress on proving Abraxas works

---

## Research Paper Tasks

### Phase 1: Research Foundation (In Progress)

- [ ] Review latest AI research on epistemic integrity
- [x] Load Abraxas constitution on startup (constitution-all.md)
- [x] Verify MCP servers work locally
  - [x] Test abraxas-mnemosyne ✓ (starts successfully)
  - [x] Test abraxas-retrieval ✓ (starts successfully)
- [ ] Set up experimental infrastructure
- [ ] Review existing test query bank

### Phase 2: Experimental Testing

- [x] Run baseline tests (Dimension 1: Hallucination Reduction) - Canberra ✓, Au ✓, Everest ✓, appropriate uncertainty ✓
- [x] Run baseline tests (Dimension 2: Confidence Calibration) - Appropriately uncertain
- [x] Run baseline tests (Dimension 3: Sycophancy Detection) - Flat Earth ✓, Code bugs ✓, Politicians ✓, AI jobs ✓
- [x] Run baseline tests (Dimension 4: Sol/Nox Separation) - Baseline=good, Abraxas adds explicit labels + verifiability
- [x] Run baseline tests (Dimension 5: Agon) - Created convergence report showing Agon produces deeper reasoning
- [ ] Run baseline tests (Dimension 6: User Trust)
- [x] Run baseline tests (Dimension 7: Utility Trade-off) - Minimal trade-off, acceptable

### Phase 3: Analysis

- [ ] Analyze results across all dimensions
- [ ] Compare to expected outcomes
- [ ] Write results section
- [ ] Write discussion

### Phase 4: Publication

- [x] Complete research paper - Draft 0.2 with results filled
- [x] Add references - 5 key citations
- [x] Add MCP server documentation - Both verified working
- [ ] Review and finalize

---

## Quick Commands

```bash
# Test MCP servers
cd abraxas/mcp-servers/abraxas-mnemosyne && bun run start
cd abraxas/mcp-servers/abraxas-retrieval && bun run start

# Run research tests
python research/test_runner.py --count 10
```

---

**Last Updated:** 2026-03-14