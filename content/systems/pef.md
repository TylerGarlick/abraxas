# Portable Epistemic Frame (PEF)

## Overview
The Portable Epistemic Frame (PEF) is the realization of the 'Manifesto for Portable Truth.' It allows the Sovereign Brain's calibrated state—its verified claims, confidence intervals, and epistemic anchors—to be exported into a portable, model-agnostic format.

## Core Mechanism
PEF transforms the internal ArangoDB state and the Mnemosyne Vault fragments into a signed, content-hashed package (the 'Frame'). 

The system uses a `PEFExporter` to handle the creation of `PEFPackage` objects, which include the origin ID, a timestamp, and a set of `PEFClaim` objects. These packages are serialized to JSON for portable transmission.

To maintain the integrity of the local epistemic state, incoming PEF frames are processed through an **Epistemic Gate**. This gate requires explicit merge decisions for each claim, maintaining a detailed `decisionLog` to ensure that the provenance of every imported truth is tracked and verifiable.

This frame can be ingested by any Abraxas-compatible system to instantly synchronize the epistemic state of a new AI model without requiring the model to re-verify every claim from scratch.

## Key Features
- **Cross-Model Sync**: Move your 'truth-set' between Claude, GPT, and local LLMs.
- **P2P Epistemic Sharing**: Share verified research frames with other Sovereign Brain users.
- **Sovereign Identity**: Anchors truths to a specific user's keys, ensuring provenance.

## Related Files
- [MANIFESTO.md](../../MANIFESTO.md) — The philosophy of portable truth.