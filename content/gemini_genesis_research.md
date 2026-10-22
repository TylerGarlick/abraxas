# Gemini Genesis Prompt Loading Research

**Date:** 2026-04-16  
**Purpose:** Load Abraxas genesis prompt without full constitution

---

## 1. Gemini Prompt Length Limits

| Model | Context Window | Output Cap |
|-------|---------------|------------|
| Gemini 3 Pro | 1,000,000 tokens | 64,000 tokens |
| Gemini 3 Flash | 200,000 tokens | 32,000 tokens |
| Gemini 2.5 Pro | 1,000,000 tokens | 64,000 tokens |
| Gemini 1.5 Pro | Up to 2,000,000 tokens | 32,000 tokens |

**Key insight:** System instructions count toward the context window. A large constitution (~100k+ tokens) would consume significant space even on 1M-token models.

---

## 2. Feeding Large System Prompts

**Recommended approaches:**

1. **System Instruction Parameter** — Use `system_instruction` in `GenerateContentConfig`. Clean separation from user content, but still counts toward context limits.

2. **Context Caching** — Gemini 2.5+ supports implicit caching for repeated content. Cache the genesis prompt once, reference it across sessions. Reduces token costs and avoids re-sending.

3. **Code-Based Loading** — Store genesis prompt externally (file, GCS bucket, database). Load dynamically at runtime via Python script before API call. Keeps API payload minimal.

4. **Chunking** — Not ideal for system instructions (must be coherent), but viable if genesis prompt is modular. Send as first user message instead of system instruction.

---

## 3. Gemini-Specific APIs for Custom Prompts

- **`system_instruction` parameter** — Native support in `google.genai` SDK (see `types.GenerateContentConfig`)
- **Context Caching API** — `ai.google.dev/gemini-api/docs/caching` — Explicit caching for static content
- **Vertex AI System Instructions** — Enterprise route with additional management features

No special "constitution loading" API exists; treat genesis prompt as a standard system instruction.

---

## 4. Example Snippet

```python
from google import genai
from google.genai import types

client = genai.Client(api_key="YOUR_API_KEY")

# Load genesis prompt from external file (keeps code clean)
with open("genesis_prompt.txt", "r") as f:
    genesis_prompt = f.read()

response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents="User query here...",
    config=types.GenerateContentConfig(
        system_instruction=genesis_prompt
    ),
)

print(response.text)
```

**For caching (advanced):** Use `client.caches.create()` with the genesis prompt as cached content, then reference the cache ID in subsequent calls.

---

## Recommendation

Load genesis prompt from file → pass via `system_instruction` → enable context caching if making repeated calls. Avoid embedding full constitution unless absolutely necessary.
