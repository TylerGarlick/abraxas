
import { v4 as uuidv4 } from 'uuid';

// Interface for the Abraxas Store client to ensure type safety
interface StoreClient {
  store_get(collection: string, id: string): Promise<any>;
  store_put(collection: string, doc: any): Promise<void>;
  store_update(collection: string, id: string, patch: any): Promise<void>;
}

interface Claim {
  id?: string;
  text: string;
  evidence: string[];
  status: 'unresolved' | 'anchored' | 'superseded';
  provenance: string;
  version: number;
  createdAt?: string;
  derived_from?: string;
  superseded_by?: string;
}

/**
 * Performs a Sovereign Revision: supersedes an existing claim with a new one,
 * maintaining the evolutionary trace (lineage).
 */
async function supersedeClaim(storeClient: StoreClient, claimId: string, newContent: string, newEvidence: string[]): Promise<string> {
  // 1. Retrieve the old claim
  const oldClaim = await storeClient.store_get("claims", claimId) as Claim;
  if (!oldClaim) {
    throw new Error(`Claim ${claimId} not found in store.`);
  }

  // 2. Create the new claim
  const newId = uuidv4();
  const newClaim: Claim = {
    id: newId,
    text: newContent,
    evidence: newEvidence,
    status: 'unresolved', // New claims start as unresolved until verified
    provenance: 'derived',
    derived_from: oldClaim.id || claimId,
    version: (oldClaim.version || 1) + 1,
    createdAt: oldClaim.createdAt, // Maintain origin date
  };

  // 3. Store the new claim
  await storeClient.store_put("claims", newClaim);

  // 4. Update the old claim to be superseded
  const patch = {
    status: 'superseded',
    superseded_by: newId
  };
  await storeClient.store_update("claims", claimId, patch);

  return newId;
}

export { supersedeClaim };
