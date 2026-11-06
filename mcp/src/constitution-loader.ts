export const CANONICAL_VERSION = '4.5.0';
export const CANONICAL_VERSIONS = new Set<string>([CANONICAL_VERSION]);
export const DEFAULT_VERSION = CANONICAL_VERSION;

export type LoadResult = {
  requestedVersion: string;
  selectedVersion: string;
  status: 'known' | 'simulated';
  notes: string;
};

export function loadConstitution(requestedVersion: string = DEFAULT_VERSION): LoadResult {
  const version = requestedVersion || DEFAULT_VERSION;

  if (version === CANONICAL_VERSION) {
    return {
      requestedVersion: version,
      selectedVersion: version,
      status: 'known',
      notes: 'Canonical constitution only; no next-version promotion.'
    };
  }

  return {
    requestedVersion: version,
    selectedVersion: CANONICAL_VERSION,
    status: 'simulated',
    notes: 'Requested version is NON-CANONICAL; loaded fallback is canonical only.'
  };
}
