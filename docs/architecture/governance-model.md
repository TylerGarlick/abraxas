# Sovereign Governance Model

This document defines the architectural relationship between the laws, tools, and enforcement mechanisms that constitute the Abraxas Sovereign Brain.

## ⚖️ The Hierarchy of Sovereignty

To avoid the "Probabilistic Trap," Abraxas separates the **definition of truth** from the **mechanism of verification**. This prevents the system from becoming a hardcoded AI and ensures it remains a Sovereign entity.

### The Three Pillars

| Component | Role | Description | Analogy |
| :--- | :--- | :--- | :--- |
| **Constitution** | The "What" | Human-readable Markdown files defining the absolute requirements and laws of the system. | **The Law Book** |
| **Skills** | The "How" | The actual code (JavaScript/TypeScript/Python) that implements a specific capability or analysis. | **The Tool** |
| **MCP Servers** | The "Where" | The orchestration layer that invokes skills to enforce the Constitution in real-time. | **The Police** |

---

## 🚔 The "Law Book" Analogy

A common misconception is that the "Skills" (the code) are the source of truth. In a Sovereign system, this is incorrect.

**The Skill is a mechanism; the Constitution is the standard.**

Imagine a police force (the MCP/Soter server) using a radar gun (the Skill). The radar gun can detect that a car is going 100mph, but the radar gun does not decide if 100mph is "illegal." The **Law Book (The Constitution)** is what defines the speed limit. 

If you remove the Law Book, the police force has a tool to measure speed, but no authority to issue a ticket. Similarly, without the Constitution, Soter can detect a "Risk 5" pattern, but it has no deterministic rule to tell it that a "Risk 5" must be blocked.

---

## ⚠️ The Sovereignty Gap

The "Sovereignty Gap" occurs when rules are baked directly into the code (hardcoded). 

### Hardcoded System (Non-Sovereign)
`if (riskScore > 4) { blockRequest(); }`
*   **The Problem**: To change the safety threshold from 4 to 3, a developer must edit the code, re-test, and redeploy the server. The "Law" is trapped in the "Mechanism."

### Sovereign System (Deterministic)
`const threshold = constitution.getRule("CS-002").threshold;`
`if (riskScore > threshold) { blockRequest(); }`
*   **The Solution**: The code simply asks the Constitution what the current rule is. The user can edit the `.md` file in one second, and the system instantly enforces the new law without a single line of code changing.

**This separation ensures that the Human (the Sovereign) retains absolute control over the AI, rather than the Developer's original assumptions controlling the AI.**
