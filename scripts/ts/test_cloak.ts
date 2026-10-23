
import { SovereignCloaker } from "./sovereign_cloaking";

const cloaker = new SovereignCloaker();
const signal = "The Sovereign Signal is an irreducible fragment of the human soul.";
const key = "Abraxas_Sovereign_Key_2026";

console.log("--- SOVEREIGN CLOAKING TEST ---");
console.log(`Original Signal: ${signal}`);
console.log(`Key: ${key}`);

const cloakedObj = cloaker.cloak(signal, key);
console.log(`Cloaked Result (Sovereign Static): ${cloakedObj.cloaked}`);

const uncloaked = cloaker.uncloak(cloakedObj.cloaked, key);
console.log(`Recovered Signal: ${uncloaked}`);
console.log("----------------------------------");
