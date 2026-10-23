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
    if (f.provenanceId) {
      adj.set(id, f.provenanceId);
    }
  }

  const circularIds = new Set<string>();
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path = [];

  function findCycle(node: string) {
    visited.add(node);
    stack.add(node);
    path.push(node);

    const neighbor = adj.get(node);
    if (neighbor && nodes.has(neighbor)) {
      if (stack.has(neighbor)) {
        // Cycle found. All nodes from neighbor to the end of the current path are part of the cycle.
        const cycleStartIndex = path.indexOf(neighbor);
        for (let i = cycleStartIndex; i < path.length; i++) {
          circularIds.add(path[i]);
        }
        // We return false here because we want to find ALL cycles across the whole graph,
        // and a single DFS path might only reveal one cycle but other nodes on the path
        // could still be part of other cycles. 
        // However, once we mark the cycle, we don't need to "stop" the DFS.
      } else if (!visited.has(neighbor)) {
        findCycle(neighbor);
      }
    }

    stack.delete(node);
    path.pop();
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
        seal: false,
        trustWeight: 0
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
