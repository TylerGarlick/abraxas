export const CANONICAL_VERSION = '4.5.0';

export type LoadResult = {
  requestedVersion: string;
  selectedVersion: string;
  status: 'known' | 'simulated';
  notes: string;
};

export function loadConstitution(requestedVersion: string = CANONICAL_VERSION): LoadResult {
  if (requestedVersion === CANONICAL_VERSION) {
    return {
      requestedVersion,
      selectedVersion: requestedVersion,
      status: 'known',
      notes: 'Canonical constitution only; no next-version promotion.'
    };
  }

  return {
    requestedVersion,
    selectedVersion: CANONICAL_VERSION,
    status: 'simulated',
    notes: 'Requested version is NON-CANONICAL; loaded fallback is canonical only.'
  };
}