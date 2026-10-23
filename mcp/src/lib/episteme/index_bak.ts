import { EpistemeLogic, type EpistemicOrigin, type EpistemicMap } from '../epistemic/episteme';

const epistemeLogic = new EpistemeLogic();

export type ProvenanceKind = EpistemicOrigin | 'unknown';

export function traceClaim(claimId: string, records: any[] = []) {
  const cached = epistemeLogic.traceClaim(claimId);
  if (cached) return { ...cached, status: 'traced' };
  
  const matching = records.filter((r) => String(r.claim ?? r.text ?? "").toLowerCase().includes(claimId.toLowerCase()));
  return { 
    claimId, 
    provenance: matching.map((r) => ({ origin: r.origin ?? 'unknown', source: r.source ?? null, evidence: r.evidence ?? null })), 
    status: matching.length ? 'traced' : 'untraced' 
  };
}

export function auditSessionLogs(logs: string) {
  const lines = logs.split(/\r?\n/).filter(Boolean);
  const unsupported = lines.filter((line) => /\b(always|never|certainly|proven)\b/i.test(line) && !/\b(source|evidence|citation)\b/i.test(line));
  return { 
    totalLines: lines.length, 
    unsupportedCertainty: unsupported, 
    findings: unsupported.length, 
    risk: unsupported.length ? 'review' : 'low' 
  };
}

export { epistemeLogic as episteme };
