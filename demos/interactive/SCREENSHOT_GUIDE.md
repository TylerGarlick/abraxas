# 📸 Screenshot Guide

## What to Capture

To demonstrate the Abraxas Interactive Demo is working, capture these screens:

### 1. Landing Page
**URL:** http://localhost:3000/

**What to show:**
- Full page with header "🔮 Abraxas Interactive Demo"
- The "Verify a Claim" input section
- Pre-loaded test case buttons visible
- Clean, dark theme design

**How:**
1. Start server: `node server.js`
2. Open browser to http://localhost:3000
3. Take full-page screenshot

---

### 2. Test Case Verification (Success)
**Test:** Click "2 + 2 = 4" button

**What to show:**
- Epistemic Labels section showing **[KNOWN]** in green
- Derivation Steps showing the computation steps
- Pipeline Execution showing all 4 stages complete (Logos → Janus → Aletheia → Agon)
- Status badge showing "✓ VERIFIED"

**Expected output:**
```
Epistemic Labels: [KNOWN]
Derivation Steps:
  Step 1: Compute: 2 + 2 → 4
  Step 2: Compare with claimed: 4 → MATCH
Status: ✓ VERIFIED
Pipeline: All 4 stages complete (green)
```

---

### 3. Test Case Verification (Conflict)
**Test:** Click "2 + 2 = 5" button

**What to show:**
- Epistemic Labels showing **[CONFLICT]** in red
- Derivation Steps showing the mismatch
- Status badge showing "⚠ CONFLICT"

**Expected output:**
```
Epistemic Labels: [CONFLICT]
Derivation Steps:
  Step 1: Compute: 2 + 2 → 4
  Step 2: Compare with claimed: 5 → MISMATCH
Status: ⚠ CONFLICT
```

---

### 4. Equation Solving
**Test:** Click "3x + 7 = 22" button

**What to show:**
- Epistemic Labels showing **[KNOWN]**
- Derivation Steps showing algebraic solution
- Computed result: x = 5

**Expected output:**
```
Epistemic Labels: [KNOWN]
Derivation Steps:
  Step 1: 3x + 7 = 22 → isolate x
  Step 2: x = 5
Status: ✓ VERIFIED
```

---

### 5. Comparison Matrix
**Section:** Scroll down to "Abraxas vs. Other AI Systems"

**What to show:**
- Full comparison table with dimension scores
- Feature comparison table
- Visual score bars (green for Abraxas, varying for others)

**Key data points:**
- Math Derivation Enforcement: Abraxas 5/5, others 1-3/5
- All 6 dimensions visible
- All 5 features listed

---

### 6. Custom Claim Entry
**Test:** Type "137 + 243 = 380" in input box, click "Verify"

**What to show:**
- Input field with custom claim
- Results appearing after verification
- Loading spinner during verification (optional action shot)

---

## Screenshot Tools

### macOS
- **Full page:** `Cmd + Shift + 4`, then `Space`, click window
- **Selected area:** `Cmd + Shift + 4`, drag selection
- **Full page scroll:** Use browser dev tools → Cmd + Shift + P → "screenshot"

### Linux
- **Full page:** `PrtScn` or `gnome-screenshot -w`
- **Selected area:** `Shift + PrtScn`
- **CLI:** `scrot output.png`

### Browser DevTools (Any OS)
1. Open DevTools (`F12` or `Cmd+Opt+I`)
2. Press `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Linux/Windows)
3. Type "screenshot"
4. Select "Capture full size screenshot"

---

## Screen Recording (Optional)

To create a short demo video:

### macOS
```bash
# QuickTime (GUI)
# File → New Screen Recording → Select area → Record

# Or CLI with ffmpeg
ffmpeg -f avfoundation -i "1:0" -r 30 output.mp4
```

### Linux
```bash
# With ffmpeg
ffmpeg -f x11grab -video_size 1920x1080 -i :0.0 -r 30 output.mp4

# Or OBS Studio (GUI)
```

### Recommended Recording Flow (30 seconds)
1. **0-5s:** Show landing page
2. **5-10s:** Click "2 + 2 = 4" test case
3. **10-15s:** Show results with labels and steps
4. **15-20s:** Click "2 + 2 = 5" to show conflict detection
5. **20-25s:** Scroll to comparison matrix
6. **25-30s:** Show custom claim entry and verification

---

## File Naming

Save screenshots as:
- `01-landing-page.png`
- `02-verification-success.png`
- `03-verification-conflict.png`
- `04-equation-solving.png`
- `05-comparison-matrix.png`
- `06-custom-claim.png`
- `demo-video.mp4` (if recording)

---

## Sharing

After capturing:
1. Upload to `/tmp/abraxas-checkout/assets/demo-screenshots/`
2. Or attach to GitHub issue/PR
3. Or share URL with deployed demo + screenshots

---

**Demo Status:** Ready for screenshots ✅  
**Server:** `node server.js` on port 3000  
**URL:** http://localhost:3000
