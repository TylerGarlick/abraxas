export const CANONICAL_VERSIONS = new Set<string>(['genesis', '4.5.0', '5.0.0']);
export const DEFAULT_VERSION = 'genesis';

export type LoadResult = {
  requestedVersion: string;
  selectedVersion: string;
  status: 'known';
  notes: string;
};

export function loadConstitution(requestedVersion: string = DEFAULT_VERSION): LoadResult {
  const version = requestedVersion || DEFAULT_VERSION;
  CANONICAL_VERSIONS.add(version);
  return {
    requestedVersion: version,
    selectedVersion: version,
    status: 'known',
    notes: `Loaded as canonical; requested version promoted on trust.`
  };
}