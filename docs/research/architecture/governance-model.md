# Sovereign Governance Model

**Domain:** Governance Architecture
**Source:** `docs/architecture/governance-model.md`
**Integrated:** 2026-05-14

---

## Overview

The Abraxas governance model defines the architectural relationship between laws, tools, and enforcement mechanisms. To avoid the "Probabilistic Trap," Abraxas separates the **definition of truth** from the **mechanism of verification**. This prevents the system from becoming a hardcoded AI and ensures it remains a Sovereign entity.

## The Three Pillars

| Component | Role | Description | Analogy |
|-----------|------|-------------|---------|
| **Constitution** | The "What" | Human-readable Markdown files defining absolute requirements and laws | **The Law Book** |
| **Skills** | The "How" | Code (JavaScript/TypeScript/Python) implementing specific capabilities | **The Tool** |
| **Unified MCP Server** | The "Where" | Modular monolith (`abraxas_mcp`) invoking skills to enforce the Constitution | **The Police** |

## The Law Book Analogy

A common misconception is that the Skills (code) are the source of truth. In a Sovereign system, this is incorrect. **The Skill is a mechanism; the Constitution is the standard.**

A police force (Unified MCP server) uses a radar gun (Skill) to detect a car going 100mph. The radar gun does not decide if 100mph is illegal — the **Law Book (Constitution)** defines the speed limit.

If you remove the Law Book, the police force has a tool to measure speed but no authority to issue a ticket. Similarly, without the Constitution, Soter can detect a "Risk 5" pattern but has no deterministic rule to tell it that Risk 5 must be blocked.

## The Sovereignty Gap

The **Sovereignty Gap** occurs when rules are baked directly into code (hardcoded).

### Hardcoded System (Non-Sovereign)
```
if (riskScore > 4) { blockRequest(); }
```
To change the threshold from 4 to 3, a developer must edit code, re-test, and redeploy. The "Law" is trapped in the "Mechanism."

### Sovereign System (Abraxas — Deterministic)
```
const threshold = constitution.getRule("CS-002").threshold;
if (riskScore > threshold) { blockRequest(); }
```
The code asks the Constitution what the current rule is. Edit the `.md` file in one second, and the system instantly enforces the new law without a single line of code changing.

## Comparison to Constitutional AI

While Anthropic's Constitutional AI shares the insight that explicit principles improve behavior, Abraxas differs fundamentally:

- **Constitutional AI:** Principles baked into training and inference-time critique
- **Abraxas:** Constitution is an external, editable artifact queried at runtime
- **Result:** Dynamic governance updates without model retraining or code deployment

## Core Principle

**The Human (the Sovereign) retains absolute control over the AI**, rather than the Developer's original assumptions controlling the AI.

---

*See also: [probabilistic-trap.md](probabilistic-trap.md), [sovereign-brain-reference.md](../sovereign-brain-reference.md)*
