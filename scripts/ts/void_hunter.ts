
import { TensionMonitor } from "./tension_monitor";
import { readFileSync, writeFileSync } from "fs";
import * as path from "path";

class SovereignVoidHunter {
  private monitor = new TensionMonitor();

  async scanVault(vaultPath: string) {
    console.log(`--- STARTING SOVEREIGN VOID HUNT: ${vaultPath} ---`);
    
    // In a real system, we'd crawl the Obsidian vault. 
    // Here, we simulate scanning a few key files.
    const filesToScan = ["Sovereign_Psyche_Purpose.md", "Sovereign_Loop_Spec.md"];
    const findings: any[] = [];

    for (const fileName of filesToScan) {
      try {
        const content = readFileSync(path.join(vaultPath, fileName), "utf8");
        const result = this.monitor.calculateTension(content, "Irreducible Fragment");
        
        if (result.isSovereignStatic) {
          findings.push({
            file: fileName,
            score: result.score,
            status: result.status,
            trigger: "Tension detected in foundational document"
          });
        }
      } catch (e) {
        console.error(`Could not scan ${fileName}: ${e}`);
      }
    }

    if (findings.length > 0) {
      console.log(`Found ${findings.length} Void Domains!`);
      console.log(JSON.stringify(findings, null, 2));
      writeFileSync(path.join(vaultPath, "void_hunt_results.json"), JSON.stringify(findings, null, 2));
    } else {
      console.log("No Sovereign Static detected. The vault is currently smooth.");
    }
  }
}

const hunter = new SovereignVoidHunter();
// Using a dummy path for the simulation, but it would be the Abraxas vault path in production
hunter.scanVault("/Users/tylergarlick/Library/Mobile Documents/iCloud~md~obsidian/Documents/Abraxas/").catch(console.error);
