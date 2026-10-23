import { AppContext } from "../../context";
import { COLLECTIONS } from "../../storage";
import { verifyAnchor } from "../core";

export type SovereignPacket = {
  claimId: string;
  proposition: string;
  evidence: Array<{ id: string; content: string; weight: number }>;
  hash: string;
  signature?: string;
  timestamp: string;
};

export async function exportPacket(ctx: AppContext, claimId: string): Promise<SovereignPacket> {
  const claim = await ctx.store.collection(COLLECTIONS.claims).get(claimId);
  if (!claim) throw new Error(`Claim ${claimId} not found`);
  
  const evidence = await Promise.all(
    (claim.evidence || []).map(async (id: string) => {
      const frag = await ctx.store.collection("epistemic/fragments").get(id);
      return {
        id: id,
        content: frag?.content || "",
        weight: frag?.trustWeight || 1,
      };
    })
  );

  return {
    claimId,
    proposition: claim.text,
    evidence,
    hash: claim.hash || "unhashed",
    timestamp: new Date().toISOString(),
  };
}

export async function syncPacket(ctx: AppContext, packet: SovereignPacket) {
  // 1. Verify Hash Integrity
  const verification = await verifyAnchor(ctx.store, packet.claimId, "claim");
  
  // If not found, we accept it as a new truth from the Nexus
  if (verification.valid === false && verification.reason === "Not found") {
    ctx.log.info(`Nexus Sync: Ingesting new Sovereign Truth ${packet.claimId}`);
    
    // Insert fragments first
    for (const frag of packet.evidence) {
      await ctx.store.collection("epistemic/fragments").upsert(frag.id, {
        content: frag.content,
        trustWeight: frag.weight,
        createdAt: packet.timestamp,
      });
    }

    // Insert claim
    await ctx.store.collection(COLLECTIONS.claims).upsert(packet.claimId, {
      text: packet.proposition,
      evidence: packet.evidence.map(e => e.id),
      status: "unresolved",
      hash: packet.hash,
      provenance: "nexus_sync",
      createdAt: packet.timestamp,
    });

    return { status: "ingested", claimId: packet.claimId };
  }

  if (verification.valid === false) {
    throw new Error(`Nexus Sync Error: Packet ${packet.claimId} failed integrity check: ${verification.reason}`);
  }

  return { status: "already_exists", claimId: packet.claimId };
}
