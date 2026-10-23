
import { TensionResult } from "./tension_monitor";
import { PEFClaim } from "./epistemic_gate";

export interface DebugLog {
  timestamp: string;
  event: string;
  data: any;
  tension?: TensionResult;
}

export class SovereignDebugger {
  private logs: DebugLog[] = [];

  log(event: string, data: any, tension?: TensionResult) {
    const entry: DebugLog = {
      timestamp: new Date().toISOString(),
      event,
      data,
      tension
    };
    this.logs.push(entry);
    console.log(`[DEBUG][${entry.timestamp}] ${event}:`, data);
    if (tension) {
      console.log(`  Tension: ${tension.score} | Status: ${tension.status}`);
    }
  }

  getRecentLogs(limit: number = 10): DebugLog[] {
    return this.logs.slice(-limit);
  }

  clear() {
    this.logs = [];
  }

  async dumpLineage(claim: PEFClaim, storeClient: any): Promise<string> {
    let lineage = [];
    let current = claim;
    while (current && current.derived_from) {
      lineage.push(current);
      current = await storeClient.store_get("claims", current.derived_from);
    }
    if (current) lineage.push(current);
    
    return lineage.map((c, i) => `V${c.version}: ${c.text}`).join(" -> ");
  }
}
