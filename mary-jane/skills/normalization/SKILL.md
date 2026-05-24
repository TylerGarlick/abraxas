# Normalization Skill

Ensures both center pipelines (CAIC and UAC) produce the unified forecast schema. Handles schema drift detection, field mapping, and enforces consistency between the two data sources.

## Source of Truth

The canonical `UnifiedForecast` type lives at:
```
/home/ubuntu/.openclaw/workspace/avalanche/src/lib/types.ts
```

All normalization must produce output matching this interface.

---

## Unified Forecast Schema

```typescript
interface UnifiedForecast {
  zone: string;                              // Zone identifier (slug)
  zoneId: string;                            // Unique zone ID
  center: 'CAIC' | 'UAC';                    // Forecasting center
  dangerRating: 1 | 2 | 3 | 4 | 5;          // Numeric danger (1=Low, 5=Extreme)
  dangerByAspect: Record<string, number>;   // Danger per aspect (N, NE, E, SE, S, SW, W, NW)
  dangerByElevation: Record<string, number>; // Danger per elevation (Below Treeline, Near Treeline, Above Treeline)
  avalancheProblems: AvalancheProblem[];    // Named avalanche problems
  forecastDiscussion: string;               // Summary discussion text
  publishedAt: string;                       // ISO date
  validDay: string;                          // YYYY-MM-DD
}

interface AvalancheProblem {
  type: string;
  likelihood: string;
  size: string;
  aspect?: string[];
  elevation?: string[];
  discussion: string;
}
```

### Danger Rating Reference

| Numeric | Text Label | Color |
|---------|------------|-------|
| 1 | Low | `#22c55e` |
| 2 | Moderate | `#eab308` |
| 3 | Considerable | `#f97316` |
| 4 | High | `#ef4444` |
| 5 | Extreme | `#7f1d1d` |

---

## Center-Specific Field Mapping

### CAIC → Unified

CAIC raw data structure (`CAICZone`):
```typescript
interface CAICZone {
  id: string;           // → zoneId
  name: string;         // → zone
  danger_rating: number;        // → dangerRating (1-5)
  danger_by_aspect: Record<string, number>;  // → dangerByAspect (pass-through)
  danger_by_elevation: Record<string, number>; // → dangerByElevation (pass-through)
  problems: AvalancheProblem[];  // → avalancheProblems (pass-through)
  discussion: string;  // → forecastDiscussion
  published_at: string; // → publishedAt
}
```

Mapping rules:
- `id` → `zoneId` (prefixed with zone name in output)
- `name` → `zone`
- `danger_rating` → `dangerRating` (assert 1-5)
- `danger_by_aspect` → `dangerByAspect`
- `danger_by_elevation` → `dangerByElevation`
- `problems` → `avalancheProblems`
- `discussion` → `forecastDiscussion`
- `published_at` → `publishedAt`
- `validDay` derived from `published_at` as `YYYY-MM-DD`

### UAC → Unified

UAC raw data structure (`UACAdvisory`):
```typescript
interface UACAdvisory {
  date_issued: string;
  date_issued_timestamp: string;  // Unix timestamp → publishedAt
  overall_danger_rating: string;   // Text ("Low", "Moderate", ...) → dangerRating (numeric)
  region: string;                  // → zone
  Nid: string;                     // → zoneId (prefixed "uac-")
  avalanche_problem_1?: string;
  avalanche_problem_1_description?: string;
  avalanche_problem_2?: string;
  avalanche_problem_2_description?: string;
  avalanche_problem_3?: string;
  avalanche_problem_3_description?: string;
  bottom_line?: string;            // → forecastDiscussion
  current_conditions?: string;     // → forecastDiscussion (fallback)
  overall_danger_rose?: string;    // 24 CSV values (8 aspects × 3 elevations) → dangerByAspect + dangerByElevation
}
```

Mapping rules:
- `region` → `zone`
- `uac-${Nid}` → `zoneId`
- `overall_danger_rating` text → `dangerRating` numeric (see danger parsing below)
- `date_issued_timestamp` (Unix ms) → `publishedAt` (ISO)
- `validDay` derived from `date_issued_timestamp` as `YYYY-MM-DD`
- `overall_danger_rose` → parsed into `dangerByAspect` and `dangerByElevation` (average per axis)
- `avalanche_problem_N` + `_description` → `avalancheProblems` array
- `bottom_line` or `current_conditions` → `forecastDiscussion`

#### UAC Danger Rose Parsing

The `overall_danger_rose` field contains 24 comma-separated values representing 8 aspects × 3 elevations:

```
Order: N, NE, E, SE, S, SW, W, NW (each repeated for 3 elevation bands)
Indices: 0-7 = Below Treeline, 8-15 = Near Treeline, 16-23 = Above Treeline
```

Conversion to 1-5 scale:
- 0 → 0 (no rating)
- 1-4 → 1 (Low)
- 5-8 → 2 (Moderate)
- 9-12 → 3 (Considerable)
- 13-14 → 4 (High)
- 15-16 → 5 (Extreme)

#### UAC Danger Rating Text Parsing

```typescript
function parseDangerRating(rating: string): 1 | 2 | 3 | 4 | 5 {
  const lower = rating.toLowerCase();
  if (lower.includes('low'))       return 1;
  if (lower.includes('moderate')) return 2;
  if (lower.includes('considerable')) return 3;
  if (lower.includes('high'))     return 4;
  if (lower.includes('extreme'))  return 5;
  return 2; // default to Moderate
}
```

---

## Normalization Rules (Priority Order)

1. **Map center-specific field names** to unified names (see mapping tables above)
2. **Normalize danger ratings** to numeric (1-5) using text parsing or direct assignment
3. **Fill missing optional fields** with sensible defaults:
   - Missing `avalancheProblems` → `[]`
   - Missing `dangerByAspect` / `dangerByElevation` → `{}` or derived from dangerRating
   - Missing `validDay` → derived from `publishedAt`
4. **Attach source metadata**:
   - `center` must be `'CAIC'` or `'UAC'`
   - `zoneId` prefixed with center (e.g., `caic-101`, `uac-123`)
5. **Validate output** using `validate-schema.ts` before passing to downstream consumers

---

## Drift Detection

Drift detection is handled by the `DriftDetector` class in `self-healing.ts`. It:

1. **Validates required fields** — checks that all fields exist and are the correct type
2. **Checks `dangerRating` range** — must be 1-5
3. **Validates `center`** — must be `'CAIC'` or `'UAC'`
4. **Records validation history** — last 100 results per source
5. **Emits metrics** on drift detection (`metrics.recordDrift()`)

### Drift Response Protocol

When drift is detected:
1. Log the validation errors: `console.warn('CAIC schema drift detected:', validation.errors)`
2. Record the failure in health tracker: `healthTracker.recordFailure('CAIC', 'Schema drift: ' + JSON.stringify(errors))`
3. **Do not crash** — emit stale indicator and continue serving cached data if available
4. **Flag for human review** — the `DriftDetector.getLatestValidation(source)` output should be reviewed

### Drift Detection CLI

```bash
npx ts-node scripts/validate-schema.ts <path-to-forecast.json>
```

Exits 0 if valid, exits 1 with error details if drift detected.

---

## Before/After Examples

### CAIC Normalization

**Before** (raw CAIC zone data):
```json
{
  "id": "caic-102",
  "name": "Front Range",
  "danger_rating": 4,
  "danger_by_aspect": { "N": 4, "NE": 5, "E": 4, "SE": 3, "S": 3, "SW": 3, "W": 4, "NW": 4 },
  "danger_by_elevation": { "Below Treeline": 3, "Near Treeline": 4, "Above Treeline": 5 },
  "problems": [
    {
      "type": "Deep Persistent Slab",
      "likelihood": "Possible",
      "size": "Large to Very Large",
      "discussion": "Multiple buried weak layers exist in the snowpack."
    }
  ],
  "discussion": "Dangerous avalanche conditions exist.",
  "published_at": "2026-04-01T07:00:00.000Z"
}
```

**After** (UnifiedForecast):
```json
{
  "zone": "Front Range",
  "zoneId": "caic-102",
  "center": "CAIC",
  "dangerRating": 4,
  "dangerByAspect": { "N": 4, "NE": 5, "E": 4, "SE": 3, "S": 3, "SW": 3, "W": 4, "NW": 4 },
  "dangerByElevation": { "Below Treeline": 3, "Near Treeline": 4, "Above Treeline": 5 },
  "avalancheProblems": [
    {
      "type": "Deep Persistent Slab",
      "likelihood": "Possible",
      "size": "Large to Very Large",
      "discussion": "Multiple buried weak layers exist in the snowpack."
    }
  ],
  "forecastDiscussion": "Dangerous avalanche conditions exist.",
  "publishedAt": "2026-04-01T07:00:00.000Z",
  "validDay": "2026-04-01"
}
```

### UAC Normalization

**Before** (raw UAC advisory JSON):
```json
{
  "date_issued": "April 1, 2026",
  "date_issued_timestamp": "1743494400",
  "overall_danger_rating": "Considerable",
  "region": "Salt Lake",
  "Nid": "42",
  "avalanche_problem_1": "Persistent Slab",
  "avalanche_problem_1_description": "A buried weak layer exists 60-90cm below the surface on north to northeast aspects.",
  "avalanche_problem_2": "Wind Slab",
  "avalanche_problem_2_description": "Recent winds have created sensitive wind slabs on leeward aspects.",
  "bottom_line": "Human-triggered avalanches are possible on specific aspects.",
  "current_conditions": "Scattered clouds with light winds from the west.",
  "overall_danger_rose": "3,4,3,2,2,2,3,4,4,5,4,3,3,3,4,5,5,5,4,4,4,5,5,5"
}
```

**After** (UnifiedForecast):
```json
{
  "zone": "Salt Lake",
  "zoneId": "uac-42",
  "center": "UAC",
  "dangerRating": 3,
  "dangerByAspect": { "N": 4, "NE": 4, "E": 3, "SE": 3, "S": 3, "SW": 4, "W": 4, "NW": 4 },
  "dangerByElevation": { "Below Treeline": 3, "Near Treeline": 4, "Above Treeline": 5 },
  "avalancheProblems": [
    {
      "type": "Persistent Slab",
      "likelihood": "Possible",
      "size": "Small to Large",
      "discussion": "A buried weak layer exists 60-90cm below the surface on north to northeast aspects."
    },
    {
      "type": "Wind Slab",
      "likelihood": "Possible",
      "size": "Small to Large",
      "discussion": "Recent winds have created sensitive wind slabs on leeward aspects."
    }
  ],
  "forecastDiscussion": "Human-triggered avalanches are possible on specific aspects.",
  "publishedAt": "2026-04-01T00:00:00.000Z",
  "validDay": "2026-04-01"
}
```

---

## Scripts

### normalize.ts

Normalizes raw CAIC or UAC JSON to `UnifiedForecast[]`.

```bash
npx ts-node scripts/normalize.ts <caic|uac> <path-to-json>
```

Output: Array of normalized `UnifiedForecast` objects.

### validate-schema.ts

Validates a forecast JSON file against the `UnifiedForecast` schema.

```bash
npx ts-node scripts/validate-schema.ts <path-to-forecast.json>
```

Exit codes:
- `0` — valid, no drift
- `1` — drift detected, errors printed to stderr

---

## Integration Points

| File | Purpose |
|------|---------|
| `avalanche/src/lib/types.ts` | Source of truth for `UnifiedForecast` |
| `avalanche/src/lib/normalize-caic.ts` | CAIC normalization logic |
| `avalanche/src/lib/normalize-uac.ts` | UAC normalization logic |
| `avalanche/src/lib/self-healing.ts` | `DriftDetector`, `metrics`, `healthTracker` |
| `avalanche/src/app/api/forecast/caic/route.ts` | CAIC API endpoint (uses normalize-caic + driftDetector) |
| `avalanche/src/app/api/forecast/uac/route.ts` | UAC API endpoint (uses normalize-uac) |
