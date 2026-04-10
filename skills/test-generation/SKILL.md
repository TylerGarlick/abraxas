# Test Generation Skill

Ensures every code change in the Avalanche project has adequate test coverage before merging. Applies the same quality bar regardless of who delegates the work (human, subagent, or external contributor).

## When to Generate Tests

- **Every PR/change**: New features, bug fixes, refactors — all need tests
- **New API routes**: Must have happy path + 2+ error path tests
- **New UI components**: Must render, show data, and handle loading/error states
- **New data transformations**: Must verify output for known inputs
- **Before merging**: Coverage must pass threshold

## Test Quality Bar

### API Routes
Every API route must test:
1. Returns correct status code (200, 201, 400, 404, 500)
2. Returns correct body shape (response structure)
3. Handles errors gracefully (invalid input, missing params, server errors)

### UI Components
Every component must test:
1. Renders without crash
2. Shows correct data when populated
3. Handles loading state (skeleton/loading indicator)
4. Handles error state (error message or fallback)

### Data Transformations
Every pure function/transformation must test:
1. Produces expected output for known inputs
2. Handles boundary values (empty, null, max values)
3. Handles malformed input gracefully

## Test File Location & Naming

```
project/
├── tests/
│   ├── *.test.ts        # Unit/integration tests
│   ├── *.test.tsx       # Component tests
│   └── broken-links.test.ts  # Already exists - route smoke tests
└── scripts/
    ├── generate-tests.ts   # Auto-generates test scaffolding
    └── run-tests.ts         # Runs all tests with coverage
```

**File naming**: Use descriptive names. `*.test.ts` or `*.test.tsx`

## Test Naming Convention

### Good Test Names
Describe **what** the test verifies and **why**:

```
describe('Dashboard')
  it('shows avalanche danger for all zones')
  it('displays elevation band colors matching danger levels')
  it('falls back to cached data when API is unreachable')

describe('ForecastAPI')
  it('returns 400 when zone parameter is missing')
  it('returns 404 when zone does not exist')
  it('normalizes CAIC response to standard forecast shape')
```

### Bad Test Names
Vague, meaningless, or redundant:

```
❌ it('works')
❌ it('renders')
❌ it('should work')
❌ it('test')
❌ it('correct')
```

## Coverage Requirements

| Path Type | Happy Path | Error Paths | Edge Cases |
|-----------|------------|-------------|------------|
| API routes | 100% | 2+ per route | boundary, empty, malformed |
| UI components | 100% | loading + error | empty data, max data |
| Data transforms | 100% | invalid input | empty, null, max values |

**Minimum threshold**: 70% (enforced by `run-tests.ts`)

## Anti-Patterns to Reject

Tests will be flagged/rejected if they:

1. **Only check "no crash"** without validating behavior
   ```ts
   // BAD - doesn't assert anything meaningful
   it('loads data', () => {
     render(<Dashboard />);
   });

   // GOOD - validates actual behavior
   it('shows danger rating for each zone', () => {
     render(<Dashboard zones={testZones} />);
     expect(screen.getByText('Considerable')).toBeInTheDocument();
   });
   ```

2. **Hardcoded values without explanation**
   ```ts
   // BAD - magic number
   expect(data.length).toBe(15);

   // GOOD - explained constant
   const EXPECTED_ZONE_COUNT = 15; // CO avalanche zones
   expect(data.length).toBe(EXPECTED_ZONE_COUNT);
   ```

3. **Mock what they're supposed to test**
   ```ts
   // BAD - mocks the thing under test
   it('normalizes CAIC response', () => {
     const mockNormalize = jest.fn().mockReturnValue(expectedOutput);
     expect(mockNormalize(input)).toEqual(expectedOutput);
   });

   // GOOD - tests real implementation
   it('normalizes CAIC response to standard forecast shape', () => {
     const result = normalizeCAIC(caicRawResponse);
     expect(result.dangerLevel).toBe('considerable');
     expect(result.elevation).toMatchObject({});
   });
   ```

## Auto-Generation

### generate-tests.ts

Analyzes source files and generates starter test scaffolding. Idempotent — safe to run multiple times.

```bash
bun run scripts/generate-tests.ts
```

**What it generates:**
- Skeleton `describe`/`it` blocks for each exported function/component
- Happy path test stubs with TODOs for implementation
- Error case stubs with common error scenarios

**Usage:**
```bash
# Generate tests for a specific file
bun run scripts/generate-tests.ts src/lib/normalize-caic.ts

# Generate tests for all source files
bun run scripts/generate-tests.ts

# Preview what would be generated (dry run)
bun run scripts/generate-tests.ts --dry-run
```

### run-tests.ts

Runs all tests and fails if coverage is below threshold.

```bash
bun run scripts/run-tests.ts
```

**Exit codes:**
- `0`: All tests pass, coverage above threshold
- `1`: Tests fail OR coverage below threshold

**Coverage output:**
```
Coverage Summary:
├── API Routes:   85% (threshold: 70%)
├── Components:  72% (threshold: 70%)
├── Transforms:   90% (threshold: 70%)
└── TOTAL:        79% ✓
```

## Integration

### Existing: broken-links.test.ts

Already in `tests/` — serves as route smoke tests:
- Verifies all routes return non-404 status
- Checks `/api/forecast/all` returns 15 zones
- Validates health and validate endpoints

### Adding new tests

1. Create `tests/your-feature.test.ts` or `*.test.tsx`
2. Follow naming convention (`describe('Feature')`, `it('does X when Y')`)
3. Implement tests following quality bar
4. Run `bun run scripts/run-tests.ts` to verify

## Example: Well-Written API Test

```typescript
/**
 * Tests for /api/forecast/all endpoint
 * Validates that the all-forecasts endpoint returns correct shape
 * and handles error cases properly.
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { fetch } from 'bun';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

describe('GET /api/forecast/all', () => {
  const EXPECTED_ZONE_COUNT = 15; // CO avalanche zones

  describe('Happy Path', () => {
    it('returns 200 with array of all zone forecasts', async () => {
      const res = await fetch(`${BASE_URL}/api/forecast/all`);
      expect(res.status).toBe(200);

      const data = await res.json();
      const forecasts = Array.isArray(data) ? data : data.forecasts;

      expect(forecasts).toBeInstanceOf(Array);
      expect(forecasts.length).toBe(EXPECTED_ZONE_COUNT);
    });

    it('each forecast has required fields', async () => {
      const res = await fetch(`${BASE_URL}/api/forecast/all`);
      const data = await res.json();
      const forecasts = Array.isArray(data) ? data : data.forecasts;

      for (const forecast of forecasts) {
        expect(forecast).toMatchObject({
          id: expect.any(String),
          zone: expect.any(String),
          dangerLevel: expect.stringMatching(/low|moderate|considerable|high|extreme/),
          elevation: expect.any(Object),
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('returns 503 when upstream API fails', async () => {
      // This would require mocking the upstream - see anti-pattern note
      // In real implementation, test against actual degraded state
    });

    it('returns empty array with 200 when no zones match', async () => {
      const res = await fetch(`${BASE_URL}/api/forecast/all?region=nonexistent`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data) ? data : data.forecasts).toBeInstanceOf(Array);
    });
  });
});
```

## Commands Quick Reference

```bash
# Generate test scaffolding
bun run scripts/generate-tests.ts

# Run tests with coverage
bun run scripts/run-tests.ts

# Run specific test file
bun test tests/broken-links.test.ts

# Run with coverage report
bun test --coverage
```
