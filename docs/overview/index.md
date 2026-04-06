# Abraxas

**Solomon's Gate and the Six Systems.**

Abraxas is a multi-system practice architecture for AI-assisted reasoning, grounded in the adversarial ideal: **all forces united against hallucination, scheming, and unanchored confidence**.

The project is named for the Gnostic deity Abraxas — the archon who rules the cosmic forces of truth and illusion, neither wholly good nor wholly evil, but encompassing both. The AI, like Abraxas, operates in the space between the real and the symbolic. Abraxas makes that space navigable.

---

## The Six Systems

| System | Function | Core Problem Solved |
|--------|----------|---------------------|
| **Honest** | Anti-hallucination interface | Labels every claim as known, inferred, uncertain, or unknown |
| **Logos** | Socratic analysis | Forces explicit reasoning chains; surfaces assumptions |
| **Agon** | Adversarial debate | Forces position asymmetry; finds where disagreement is genuine |
| **Janus** | Meta-cognition / self-model | Maintains separation between factual and symbolic output |
| **Aletheia** | Anti-obfuscation | Forces plain language; resists euphemism and obscurantism |
| **Logos-Math** | Mathematical verification | Detects and corrects arithmetic, algebraic, and logical errors in AI math output |

Six systems, six distinct failure modes addressed.

---

## Skills vs. Constitution

Abraxas ships two ways:

### As Claude Code Skills

Install the `.skill` archives and use slash commands:

```
unzip honest.skill -d ~/.claude/skills/
unzip logos.skill -d ~/.claude/skills/
unzip agon.skill -d ~/.claude/skills/
unzip janus-system.skill -d ~/.claude/skills/
unzip aletheia.skill -d ~/.claude/skills/
unzip logos-math.skill -d ~/.claude/skills/
```

See [Skills Reference](./skills.md) for the full command documentation.

### As a Constitution

Load `CONSTITUTION.md` as your system prompt in any LLM. Every system activates without installation.

| Platform | Instructions |
|----------|-------------|
| Claude.ai | Settings → Advanced → System prompt → Paste CONSTITUTION.md |
| ChatGPT | Settings → GPT-4 → Custom instructions → Paste |
| Gemini | Settings → Gemini → Advanced settings → System prompt |
| Ollama | `ollama run model -p system "$(cat CONSTITUTION.md)"` |
| LM Studio | System prompt field → Paste CONSTITUTION.md |

---

## Project Status

Active development. All six systems are operational.

For architecture details, see [Architecture](./architecture.md).
For testing methodology, see [Testing](./testing.md).
For command documentation, see [Skills Reference](./skills.md).

---

## Contributing

See [PLAN.md](../PLAN.md) for the full project roadmap, testing strategy, and contribution guidelines.
