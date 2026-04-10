/**
 * normalize.ts
 * Normalizes raw CAIC or UAC JSON to UnifiedForecast[].
 *
 * Usage:
 *   npx ts-node scripts/normalize.ts caic <path-to-json>
 *   npx ts-node scripts/normalize.ts uac <path-to-json>
 */

import * as fs from 'fs';

type Center = 'CAIC' | 'UAC';

// ============================================================
// Types (mirrors avalanche/src/lib/types.ts)
// ============================================================

interface AvalancheProblem {
  type: string;
  likelihood: string;
  size: string;
  aspect?: string[];
  elevation?: string[];
  discussion: string;
}

interface UnifiedForecast {
  zone: string;
  zoneId: string;
  center: 'CAIC' | 'UAC';
  dangerRating: 1 | 2 | 3 | 4 | 5;
  dangerByAspect: Record<string, number>;
  dangerByElevation: Record<string, number>;
  avalancheProblems: AvalancheProblem[];
  forecastDiscussion: string;
  publishedAt: string;
  validDay: string;
}

// ============================================================
// Shared helpers
// ============================================================

function toValidDay(isoOrTimestamp: string | number): string {
  if (typeof isoOrTimestamp === 'number') {
    return new Date(isoOrTimestamp * 1000).toISOString().split('T')[0];
  }
  if (typeof isoOrTimestamp === 'string') {
    const num = parseInt(isoOrTimestamp, 10);
    if (!isNaN(num) && isoOrTimestamp.length <= 13) {
      return new Date(num * 1000).toISOString().split('T')[0];
    }
    return isoOrTimestamp.split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

// ============================================================
// CAIC Normalization
// ============================================================

interface CAICZone {
  id: string;
  name: string;
  danger_rating: number;
  danger_by_aspect: Record<string, number>;
  danger_by_elevation: Record<string, number>;
  problems: AvalancheProblem[];
  discussion: string;
  published_at: string;
}

function normalizeCAIC(zones: CAICZone[]): UnifiedForecast[] {
  return zones.map((zone) => ({
    zone: zone.name,
    zoneId: zone.id,
    center: 'CAIC' as Center,
    dangerRating: (Math.min(5, Math.max(1, zone.danger_rating))) as 1 | 2 | 3 | 4 | 5,
    dangerByAspect: zone.danger_by_aspect ?? {},
    dangerByElevation: zone.danger_by_elevation ?? {},
    avalancheProblems: zone.problems ?? [],
    forecastDiscussion: zone.discussion ?? '',
    publishedAt: zone.published_at ?? new Date().toISOString(),
    validDay: toValidDay(zone.published_at),
  }));
}

// ============================================================
// UAC Normalization
// ============================================================

interface UACAdvisory {
  date_issued: string;
  date_issued_timestamp: string;
  overall_danger_rating: string;
  region: string;
  Nid: string;
  avalanche_problem_1?: string;
  avalanche_problem_1_description?: string;
  avalanche_problem_2?: string;
  avalanche_problem_2_description?: string;
  avalanche_problem_3?: string;
  avalanche_problem_3_description?: string;
  bottom_line?: string;
  current_conditions?: string;
  overall_danger_rose?: string;
}

function parseDangerRating(rating: string): 1 | 2 | 3 | 4 | 5 {
  const lower = rating.toLowerCase();
  if (lower.includes('low')) return 1;
  if (lower.includes('moderate')) return 2;
  if (lower.includes('considerable')) return 3;
  if (lower.includes('high')) return 4;
  if (lower.includes('extreme')) return 5;
  return 2;
}

function parseDangerRose(
  rose: string,
  defaultRating: 1 | 2 | 3 | 4 | 5
): { dangerByAspect: Record<string, number>; dangerByElevation: Record<string, number> } {
  const aspects = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const elevations = ['Below Treeline', 'Near Treeline', 'Above Treeline'];

  const values = rose.split(',').map((v) => {
    const n = parseInt(v.trim(), 10);
    return isNaN(n) ? 0 : n;
  });

  const dangerByAspect: Record<string, number> = {};
  const dangerByElevation: Record<string, number> = {};

  // Average by aspect (3 elevation values per aspect)
  for (let i = 0; i < 8; i++) {
    const aspectVals = [values[i], values[i + 8], values[i + 16]].filter((v) => v > 0);
    dangerByAspect[aspects[i]] =
      aspectVals.length > 0
        ? (Math.round(aspectVals.reduce((a, b) => a + b, 0) / aspectVals.length / 3) as 1 | 2 | 3 | 4 | 5)
        : defaultRating;
  }

  // Average by elevation (8 values per elevation band)
  for (let e = 0; e < 3; e++) {
    const elevVals = values.slice(e * 8, (e + 1) * 8).filter((v) => v > 0);
    dangerByElevation[elevations[e]] =
      elevVals.length > 0
        ? (Math.round(elevVals.reduce((a, b) => a + b, 0) / elevVals.length / 8) as 1 | 2 | 3 | 4 | 5)
        : defaultRating;
  }

  return { dangerByAspect, dangerByElevation };
}

function extractProblems(advisory: UACAdvisory): AvalancheProblem[] {
  const problems: AvalancheProblem[] = [];

  for (const n of [1, 2, 3] as const) {
    const type = advisory[`avalanche_problem_${n}` as keyof UACAdvisory] as string | undefined;
    const desc = advisory[`avalanche_problem_${n}_description` as keyof UACAdvisory] as string | undefined;
    if (type && desc) {
      problems.push({ type, likelihood: 'Possible', size: 'Small to Large', discussion: desc });
    }
  }

  return problems;
}

interface UACInput {
  advisories: Array<{ advisory: UACAdvisory }>;
}

function normalizeUAC(data: UACInput): UnifiedForecast[] {
  return data.advisories.map(({ advisory }) => {
    const dangerRating = parseDangerRating(advisory.overall_danger_rating ?? 'Moderate');
    const publishedAt = new Date(parseInt(advisory.date_issued_timestamp ?? '0', 10) * 1000).toISOString();

    let dangerByAspect: Record<string, number> = {};
    let dangerByElevation: Record<string, number> = {};

    if (advisory.overall_danger_rose) {
      ({ dangerByAspect, dangerByElevation } = parseDangerRose(advisory.overall_danger_rose, dangerRating));
    }

    return {
      zone: advisory.region ?? 'Unknown',
      zoneId: `uac-${advisory.Nid ?? '0'}`,
      center: 'UAC' as Center,
      dangerRating,
      dangerByAspect,
      dangerByElevation,
      avalancheProblems: extractProblems(advisory),
      forecastDiscussion: advisory.bottom_line ?? advisory.current_conditions ?? '',
      publishedAt,
      validDay: toValidDay(advisory.date_issued_timestamp ?? Date.now().toString()),
    };
  });
}

// ============================================================
// CLI
// ============================================================

function usage(): void {
  console.error('Usage: normalize.ts <caic|uac> <path-to-json>');
  process.exit(1);
}

async function main(): Promise<void> {
  const [, , centerArg, filePath] = process.argv;

  if (!centerArg || !filePath) usage();
  if (centerArg !== 'caic' && centerArg !== 'uac') usage();

  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  let result: UnifiedForecast[];

  if (centerArg === 'caic') {
    result = normalizeCAIC(Array.isArray(data) ? data : [data]);
  } else {
    result = normalizeUAC(data);
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
