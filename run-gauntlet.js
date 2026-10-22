/**
 * run-gauntlet.js
 * 
 * Runner for the Sovereign Gauntlet.
 */

const SovereignGauntlet = require('./skills/sovereign-gauntlet');

async function main() {
  const gauntlet = new SovereignGauntlet();
  const success = await gauntlet.runAll();
  
  if (success) {
    console.log('\n🛡️  THE DETERMINISTIC SHIELD IS HARDENED.');
    process.exit(0);
  } else {
    console.log('\n⚠️  SHIELD BREACH DETECTED. Remediation required.');
    process.exit(1);
  }
}

main().catch(console.error);
