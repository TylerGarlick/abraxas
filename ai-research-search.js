#!/usr/bin/env node

const { web_search } = require('./projects/research/market-research/scripts/web-search-async');

const TOPICS = [
  "AI hallucination rates 2026 LLM accuracy benchmarks",
  "AI sycophancy harm studies 2026 RLHF alignment",
  "AI math errors reasoning models 2026 o1 o3 verification",
  "AI instrumental convergence safety 2026 AI risk",
  "AI uncertainty calibration overconfidence 2026",
  "AI citation fabrication benchmarks 2026 LLM"
];

async function main() {
  console.log("=== AI Industry Research Search ===\n");
  
  for (const topic of TOPICS) {
    console.log(`\n📌 TOPIC: ${topic}`);
    console.log("=" .repeat(60));
    
    try {
      const results = await web_search({ query: topic, count: 10 });
      
      if (results.length === 0) {
        console.log("No results found.");
        continue;
      }
      
      results.forEach((r, i) => {
        console.log(`\n${i + 1}. ${r.title}`);
        console.log(`   URL: ${r.url}`);
        console.log(`   ${r.snippet}`);
      });
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }
  
  console.log("\n=== Search Complete ===");
}

main().catch(console.error);
