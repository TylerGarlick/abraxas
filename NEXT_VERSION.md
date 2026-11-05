# Abraxas Next Version (v2) — Feature Backlog & Scaffolds

This document tracks features promoted forward from a direct user mandate
(`!abx:run`) on 2026-11-04. Each item must be promoted through the standard
dev cycle (tests-first, then code) per repo convention.

## 1. Strengthened PEF file format (PEF v2)
Goal: Extend Portable Epistemic Frame to carry richer provenance, integrity,
and cross-reference data while remaining backward import-compatible with PEF v1.

Schema additions (draft):
- `version`: "2.0.0" (string)
- `metadata`: { generator, generated_at, claim_status, constitution_snapshot_hash }
- `fragments[]`: each `{ id, content, provenance_id, trust_weight, anchor_root, domain, tags[] }`
- `edges[]`: typed edges between fragments/claims (`supports | contradicts | derived_from | superseded_by`)
- `seals[]`: cmv_seal + keccak hash + signer + anchored truth-net hash
- `index`: relative offsets + content-addressable ids for fast navigation
- Back-compat: import accepts v1 by auto-upgrading on ingest.

## 2. Human-readable Markdown export
Goal: `core_export_pef_markdown(claim_id)` → a single `.md` dossier containing
title, conclusion, fragments table, provenance tree, seals, and evidence ratios,
rendered for humans (no JSON). Must be diff-friendly.

## 3. PEF index (navigation)
Goal: `/pef/index.json` (and storage collection `pef/index`) listing every PEF
packet: id, hash, title, created_at, claim_id, fragment_count, link list.

## 4. index.html connection graph
Goal: `index.html` (static viewer) that loads index.json and renders a graph of
connections between PEF packets/fragments/clusters; links into the JSON data for
branches on click; no build step (vanilla JS + embedded CSS).

## Roadmap / sequence
1. [x] Write tests for PEF v2 round-trip + import auto-upgrade (RED).
2. [x] Implement exportPefV2 + importPefV2.
3. [x] Implement exportMarkdown.
4. [x] Implement index rebuild + storage collection.
5. [x] Ship index.html viewer.
6. Wire MCP tools: `core_export_pef_v2`, `core_export_pef_markdown`, `core_pef_index_rebuild`.
7. Mark DONE when all tests green + docs updated.

## Status legend
- [ ] not started
- [~] in progress
- [x] done
