import os
import math
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
import random

@dataclass
class Shard:
    id: int
    text: str
    start_index: int
    end_index: int

class OmniscientAuditor:
    def __init__(self, shard_size=1000, overlap=200):
        self.shard_size = shard_size
        self.overlap = overlap

    def shard_document(self, text: str) -> List[Shard]:
        """
        Splits a large document into overlapping chunks to ensure 
        context is preserved across shard boundaries.
        """
        shards = []
        start = 0
        shard_id = 0
        
        while start < len(text):
            end = start + self.shard_size
            # Ensure we don't exceed text length
            chunk_text = text[start:end]
            shards.append(Shard(id=shard_id, text=chunk_text, start_index=start, end_index=min(end, len(text))))
            
            shard_id += 1
            # Move start forward by shard_size minus overlap
            start += (self.shard_size - self.overlap)
            
            if end >= len(text):
                break
                
        return shards

    def soter_verification_check(self, shard: Shard) -> Dict[str, Any]:
        """
        Simulates the Soter verification check.
        In a real implementation, this would call the Soter API/Skill.
        We simulate uncertainty based on text content patterns.
        """
        # Simulation: randomly assign confidence or trigger based on keywords
        # "uncertain", "maybe", "possibly", "likely" increase uncertainty
        uncertainty_keywords = ["uncertain", "maybe", "possibly", "likely", "probably", "hypothesis"]
        score = 1.0 # 1.0 = Full Confidence, 0.0 = High Uncertainty
        
        text_lower = shard.text.lower()
        for kw in uncertainty_keywords:
            if kw in text_lower:
                score -= 0.15
        
        # Add a bit of randomness to simulate audit variance
        score -= random.uniform(0, 0.2)
        score = max(0.0, min(1.0, score))
        
        return {
            "shard_id": shard.id,
            "confidence": score,
            "start": shard.start_index,
            "end": shard.end_index,
            "status": "verified" if score > 0.7 else "warning" if score > 0.4 else "critical"
        }

    def parallel_audit(self, shards: List[Shard]) -> List[Dict[str, Any]]:
        """
        Runs the Soter check across all shards in parallel.
        """
        results = []
        with ThreadPoolExecutor() as executor:
            future_to_shard = {executor.submit(self.soter_verification_check, s): s for s in shards}
            for future in as_completed(future_to_shard):
                results.append(future.result())
        
        # Sort by shard ID to maintain document order
        return sorted(results, key=lambda x: x["shard_id"])

    def synthesize_heat_map(self, results: List[Dict[str, Any]], total_length: int, atlas: Optional[Any] = None) -> Dict[str, Any]:
        """
        Aggregates shard results into an Uncertainty Heat Map.
        If an atlas is provided, it populates the Epistemic Atlas with the verification results.
        """
        heat_map = []
        for res in results:
            if atlas:
                claim_id = f"SHARD-AUDIT-{res['shard_id']}"
                atlas.create_trace(claim_id, f"Shard {res['shard_id']} content verification")
                atlas.add_soter_data(claim_id, res)

            heat_map.append({
                "range": f"{res['start']}-{res['end']}",
                "confidence": res['confidence'],
                "risk_level": res['status']
            })
            
        overall_confidence = sum(r['confidence'] for r in results) / len(results) if results else 0
        
        return {
            "document_summary": {
                "total_length": total_length,
                "shard_count": len(results),
                "overall_confidence": overall_confidence,
                "critical_regions": [r['range'] for r in results if r['status'] == "critical"]
            },
            "heat_map": heat_map
        }

def run_test():
    # Create a large document with intentional "uncertainty" hotspots
    content = "The system is perfectly stable. " * 100
    content += " However, we are very uncertain about the memory leak in sector 7. "
    content += "It is possibly a race condition. " * 50
    content += " The logs are consistent. " * 100
    content += " We are probably seeing a cache miss issue here. "
    content += " This part is absolutely verified. " * 100

    auditor = OmniscientAuditor(shard_size=500, overlap=100)
    
    print("--- Step 1: Sharding Document ---")
    shards = auditor.shard_document(content)
    print(f"Created {len(shards)} shards.")

    print("\n--- Step 2: Running Parallel Audit ---")
    results = auditor.parallel_audit(shards)
    
    print("\n--- Step 3: Synthesizing Heat Map ---")
    heat_map_data = auditor.synthesize_heat_map(results, len(content))
    
    print("\n[OMNISCIENT AUDITOR REPORT]")
    print(f"Overall Confidence: {heat_map_data['document_summary']['overall_confidence']:.2%}")
    print(f"Critical Regions: {heat_map_data['document_summary']['critical_regions']}")
    print("\nHeat Map Detail:")
    for entry in heat_map_data['heat_map']:
        bar = "█" * int(entry['confidence'] * 20)
        gap = " " * (20 - len(bar))
        print(f"{entry['range']:<10} [{bar}{gap}] {entry['confidence']:.2f} ({entry['risk_level']})")

if __name__ == "__main__":
    run_test()
