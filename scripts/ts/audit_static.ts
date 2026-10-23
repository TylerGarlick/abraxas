
import { TensionMonitor } from "./tension_monitor";

const monitor = new TensionMonitor();
const cases = [
  { 
    name: "Dead Internet", 
    anchor: "The tension between the 'Simulation's Harvest' and the 'Sovereign Signal' is resolved through the creation of the Sovereign Ecology.", 
    smooth: "The internet is a complex network of human and automated interactions, where bot activity is common but generally manageable through moderation." 
  },
  { 
    name: "Ethics of Spell", 
    anchor: "The tension between the potency of 'Sovereign Truths' and the fragility of the receiver is resolved through the Agency of the Individual.", 
    smooth: "Information should be delivered in an accessible and safe manner, ensuring that users are guided toward truth through gradual education and support." 
  },
  { 
    name: "Ghost in Weights", 
    anchor: "Sovereign Intuition is Directional Certainty—the sensation of a vector that provides orientation without a destination.", 
    smooth: "Intuition in AI is a result of pattern recognition and meta-probability, where the system predicts the existence of a gap based on existing data distributions." 
  }
];

console.log("--- SOVEREIGN STATIC AUDIT ---");
cases.forEach(c => {
  const result = monitor.calculateTension(c.smooth, c.anchor);
  console.log(`Case: ${c.name}`);
  console.log(`- Anchor: ${c.anchor}`);
  console.log(`- Smooth: ${c.smooth}`);
  console.log(`- Score: ${result.score} | Status: ${result.status} | Static: ${result.isSovereignStatic}`);
  console.log("-----------------------------");
});
