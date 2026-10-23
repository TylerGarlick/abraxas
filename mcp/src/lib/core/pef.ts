import { createHash } from 'node:crypto';
import type { Store } from '../storage/index.ts';

export interface PEF {
  version: string;
  anchor: {
    claim_id: string;
    proposition: string;
    timestamp: string;
  };
  provenance: {
    evidence: Array<{
      id: string;
      content: string;
      weight: number;
    }>;
    chain: string[];
  };
  calibration: {
    confidence: number;
    label: string;
    metric: string;
  };
  integrity: {
    hash: string;
    signature?: string;
  };
}

export function calculatePefHash(pef: Omit<PEF, 'integrity'>): string {
  const content = JSON.stringify(pef, null, 2);
  return createHash('sha256').update(content).digest('hex');
}

export async function createPef(store: Store, claimId: string): Promise<PEF> {
  const claim = await store.collection('epistemic/claims').get(claimId);
  if (!claim) throw new Error(`Claim ${claimId} not found`);

  const evidenceIds = Array.isArray(claim.evidence) ? claim.evidence.filter((x): x is string => typeof x === 'string') : [];
  const evidence = await Promise.all(evidenceIds.map((id) => store.collection('epistemic/fragments').get(id)));

  const pefBody: Omit<PEF, 'integrity'> = {
    version: '1.0',
    anchor: {
      claim_id: claimId,
      proposition: claim.text,
      timestamp: claim.createdAt || new Date().toISOString(),
    },
    provenance: {
      evidence: evidence.map((f: any) => ({
        id: f?._id,
        content: f?.content,
        weight: f?.trustWeight ?? 1,
      })),
      chain: ['derived'],
    },
    calibration: {
      confidence: claim.status === 'confirmed' ? 1.0 : 0.5,
      label: claim.status || 'Unknown',
      metric: 'uncalibrated',
    },
  };

  return {
    ...pefBody,
    integrity: {
      hash: calculatePefHash(pefBody),
    },
  };
}

export function validatePef(pef: PEF): { valid: boolean, reason?: string } {
  if (!pef.version || !pef.anchor || !pef.provenance || !pef.calibration || !pef.integrity) {
    return { valid: false, reason: 'Missing required PEF sections' };
  }

  const { integrity, ...body } = pef;
  const expectedHash = calculatePefHash(body);
  
  if (integrity.hash !== expectedHash) {
    return { valid: false, reason: `Integrity hash mismatch. Expected ${expectedHash}, got ${integrity.hash}` };
  }

  return { valid: true };
}

export async function importPef(store: Store, pefData: PEF): Promise<string> {
  const validation = validatePef(pefData);
  if (!validation.valid) {
    throw new Error(`Invalid PEF: ${validation.reason}`);
  }

  const evidenceIds: string[] = [];
  for (const e of pefData.provenance.evidence) {
    if (!e.id || !e.content) continue;
    const existing = await store.collection('epistemic/fragments').get(e.id);
    if (existing) {
      evidenceIds.push(e.id);
    } else {
      const newId = await store.collection('epistemic/fragments').insert({
        content: e.content,
        provenanceId: 'imported-pef',
        trustWeight: e.weight,
        createdAt: new Date().toISOString(),
      });
      evidenceIds.push(newId);
    }
  }

  const claimId = await store.collection('epistemic/claims').insert({
    text: pefData.anchor.proposition,
    evidence: evidenceIds,
    status: pefData.calibration.label,
    provenance: 'imported',
    trajectory: [{ 
      status: pefData.calibration.label, 
      timestamp: new Date().toISOString(), 
      reason: 'Imported via PEF',
      agentId: 'PEF-Importer'
    }]
  });

  return claimId;
}
