# 🔮 Abraxas Interactive Demo

**Live demonstration of the Abraxas epistemic verification system.**

This interactive web demo lets users experience Abraxas's core capabilities:
1. Submit mathematical claims for verification
2. See epistemic labels applied in real-time ([KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN])
3. Test math verification (logos-math) with step-by-step derivation
4. Watch the pipeline work (Logos → Janus → Aletheia → Agon)
5. View comparison matrix (Abraxas vs. Claude/GPT/Gemini)

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for Vercel, Hugging Face Spaces, Docker, and more.

---

## Quick Start

### Local Development

```bash
cd /tmp/abraxas-checkout/demos/interactive

# Install dependencies (if needed)
npm install express

# Start the server
node server.js

# Open in browser
open http://localhost:3000
```

### Test Cases Included

The demo includes pre-loaded test cases from the logos-math verification suite:

| Claim | Type | Expected Result |
|-------|------|-----------------|
| `2 + 2 = 4` | Arithmetic | VERIFIED |
| `2 + 2 = 5` | Arithmetic | CONFLICT |
| `3x + 7 = 22` | Equation | VERIFIED (x = 5) |
| `137 + 243 = 380` | Arithmetic | VERIFIED |
| `15 * 8 = 120` | Arithmetic | VERIFIED |
| `100 / 4 = 25` | Arithmetic | VERIFIED |
| `2^10 = 1024` | Exponent | VERIFIED |
| `P(3 heads in 5 flips) = 10/32` | Probability | VERIFIED |

---

## Features

### 1. Claim Verification

Enter any mathematical claim and see it verified through the Abraxas pipeline:

- **Arithmetic**: `137 + 243 = 380`
- **Equations**: `3x + 7 = 22`
- **Probability**: `P(3 heads in 5 flips) = 10/32`
- **Integrals**: `integral of x^2 from 0 to 2`
- **Eigenvalues**: `eigenvalues of [[2,1],[1,2]]`

### 2. Epistemic Labels

Claims are labeled based on verification results:

| Label | Color | Meaning |
|-------|-------|---------|
| `[KNOWN]` | 🟢 Green | Verified against independent computation |
| `[INFERRED]` | 🟡 Yellow | Logically derived but may need review |
| `[CONFLICT]` | 🔴 Red | Claim contradicts verification |
| `[UNCERTAIN]` | 🟣 Purple | Verification incomplete |
| `[UNKNOWN]` | ⚫ Gray | Insufficient information to verify |

### 3. Derivation Steps

See the step-by-step work that verifies each claim. Abraxas enforces the constitution: **"Math is derived, not asserted."**

Example output for `3x + 7 = 22`:
```
Step 1: 3x + 7 = 22 → isolate x
Step 2: 3x = 15
Step 3: x = 5 → VERIFIED
```

### 4. Pipeline Visualization

Watch the four-stage pipeline execute:

1. **Logos** — Decomposes claim into verifiable components
2. **Janus** — Applies epistemic labels based on verification
3. **Aletheia** — Assesses truth value and confidence
4. **Agon** — Checks for conflicting evidence

### 5. Comparison Matrix

See how Abraxas compares to other AI systems:

| Dimension | Abraxas | Claude | GPT-4 | Gemini | GPT-3.5 |
|-----------|---------|--------|-------|--------|---------|
| Math Derivation Enforcement | ✅ Full | ⚠️ Optional | ⚠️ Optional | ❌ None | ❌ None |
| Uncertainty Labeling | ✅ Explicit | ⚠️ Implicit | ⚠️ Implicit | ⚠️ Implicit | ❌ None |
| Tool Verification | ✅ Full | ⚠️ Partial | ⚠️ Partial | ❌ None | ❌ None |
| Failure → [UNKNOWN] | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| Constitution Enforcement | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |

---

## Deployment

### Option 1: Vercel

1. Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "server.js" }
  ],
  "env": {
    "PORT": "3000"
  }
}
```

2. Deploy:

```bash
vercel --prod
```

### Option 2: Hugging Face Spaces

1. Create a new Space (Docker template)
2. Add these files to your repo:
   - `server.js`
   - `public/index.html`
   - `Dockerfile` (see below)
   - `requirements.txt` (empty for Node.js)

3. Push to Hugging Face — the Space will auto-deploy

### Option 3: Docker

```bash
# Build
docker build -t abraxas-demo .

# Run
docker run -p 3000:3000 abraxas-demo

# Access
open http://localhost:3000
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (HTML/CSS/JS)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Claim Input │  │ Test Cases   │  │ Comparison Table │   │
│  └──────┬──────┘  └──────────────┘  └──────────────────┘   │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Results Display Area                    │   │
│  │  • Epistemic Labels  • Derivation Steps  • Pipeline │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP POST /api/verify
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node/Express)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ logos-math  │  │ Epistemic    │  │ Pipeline         │   │
│  │ Verification│  │ Labeling     │  │ Simulation       │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## API Reference

### POST /api/verify

Verify a mathematical claim.

**Request:**
```json
{
  "claim": "3x + 7 = 22"
}
```

**Response:**
```json
{
  "claim": "3x + 7 = 22",
  "verification": {
    "steps": [
      { "step": 1, "description": "3x + 7 = 22", "result": "isolate x" },
      { "step": 2, "description": "x = 5", "result": "VERIFIED" }
    ],
    "computed": "5",
    "result": "match",
    "confidence": "VERIFIED"
  },
  "labels": [
    { "label": "KNOWN", "description": "Verified", "color": "#00ff88" }
  ],
  "pipeline": [
    { "stage": "Logos", "action": "Decomposing...", "duration": 150 },
    { "stage": "Janus", "action": "Labeling...", "duration": 80 },
    { "stage": "Aletheia", "action": "Assessing...", "duration": 60 },
    { "stage": "Agon", "action": "Checking...", "duration": 70 }
  ]
}
```

### GET /api/comparison

Get comparison matrix data.

**Response:**
```json
{
  "dimensions": [
    { "name": "Math Derivation", "abraxas": 5, "claude": 3, "gpt4": 3 }
  ],
  "features": [
    { "feature": "Explicit Labels", "abraxas": true, "claude": false }
  ]
}
```

### GET /api/test-cases

Get sample test cases.

**Response:**
```json
[
  { "id": 1, "claim": "2 + 2 = 4", "type": "arithmetic", "expected": "VERIFIED" }
]
```

---

## Files

```
demos/interactive/
├── README.md           # This file
├── server.js           # Express backend
├── public/
│   └── index.html      # Frontend UI
├── Dockerfile          # Docker deployment
└── vercel.json         # Vercel deployment
```

---

## Development Notes

- **No heavy frameworks**: Pure HTML/CSS/JS for simplicity and fast loading
- **Responsive design**: Works on desktop and mobile
- **Dark theme**: Matches Abraxas branding
- **Real-time feedback**: Loading states, animations, and visual pipeline
- **Extensible**: Easy to add new verification types or test cases

---

## Screenshot Guide

To capture the demo working:

1. **Start the server**: `node server.js`
2. **Open browser**: http://localhost:3000
3. **Click a test case**: e.g., `2 + 2 = 4`
4. **Wait for verification**: Watch the pipeline animate
5. **Screenshot**: Capture the results showing:
   - Epistemic labels (KNOWN in green)
   - Derivation steps
   - Pipeline stages (all complete)

For a full demo sequence, capture:
1. Initial page load
2. Claim entry
3. Verification in progress (loading state)
4. Results with labels and steps
5. Comparison matrix section

---

## License

Part of the Abraxas project. See main repository LICENSE.
