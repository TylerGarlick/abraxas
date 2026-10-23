import type { Store } from "../../storage/index.ts";

interface Fragment {
  _id: string;
  content: string;
  provenanceId?: string;
  trustWeight?: number;
  seal?: boolean;
}

export async function auditNexusProvenance(store: Store) {
  const fragmentsCol = store.collection("epistemic/fragments");
  const fragments = (await fragmentsCol.find()) as unknown as Fragment[];
  
  const adj = new Map<string, string>();
  const nodes = new Set<string>();

  for (const f of fragments) {
    const id = f._id;
    nodes.add(id);
    if (f.provenanceId && f.provenanceId !== id) {
      adj.set(id, f.provenanceId);
    }
  }

  const circularIds = new Set<string>();
  const visited = new Set<string>();
  const stack = new Set<string>();

  function findCycle(node: string) {
    visited.add(node);
    stack.add(node);

    const neighbor = adj.get(node);
    if (neighbor && nodes.has(neighbor)) {
      if (stack.has(neighbor)) {
        circularIds.add(node);
        return true;
      }
      if (!visited.has(neighbor)) {
        if (findCycle(neighbor)) {
          circularIds.add(node);
          return true;
        }
      }
    }

    stack.delete(node);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node)) {
      findCycle(node);
    }
  }

  const updates = [];
  for (const id of circularIds) {
    const fragment = (await fragmentsCol.get(id)) as unknown as Fragment | null;
    if (fragment) {
      let content = fragment.content || "";
      if (!content.includes("[CIRCULAR]")) {
        content = `[CIRCULAR] ${content}`;
      }
      
      updates.push(fragmentsCol.update(id, { 
        content, 
        seal: false, // Strip Sovereign Seal
        trustWeight: 0 // Downgrade trust
      }));
    }
  }

  await Promise.all(updates);
  return { 
    totalChecked: fragments.length, 
    circularFound: circularIds.size, 
    affectedIds: Array.from(circularIds) 
  };
}
