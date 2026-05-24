import asyncio
from typing import List, Dict, Any
from soter.src.omniscient_auditor import OmniscientAuditor
from soter.src.epistemic_atlas import EpistemicAtlas
from logos.verification import CrossSourceVerificationEngine

async def main():
    # 1. Initialize components
    atlas = EpistemicAtlas()
    auditor = OmniscientAuditor(shard_size=500, overlap=100)
    logos_engine = CrossSourceVerificationEngine()
    
    content = "The Earth's atmosphere is warming due to human CO2 emissions. This is a verified fact. " * 10
    content += " However, the exact speed of glacier melt in the Andes is slightly uncertain. " * 5
    
    print("\n--- Phase 1: Soter Omniscient Audit ---")
    shards = auditor.shard_document(content)
    results = auditor.parallel_audit(shards)
    # Integrate Soter results into Atlas
    auditor.synthesize_heat_map(results, len(content), atlas=atlas)
    print(f"Soter audit complete. {len(atlas.atlas)} traces created.")

    # 2. Focus on a specific claim extracted from a critical/warning region
    # In real use, we'd use an LLM to extract claims from shards
    test_claim = "The Earth's atmosphere is warming due to human CO2 emissions"
    claim_id = "CLAIM-Sovereign-001"
    
    print(f"\n--- Phase 2: Logos Symbolic Verification for {claim_id} ---")
    trace = atlas.create_trace(claim_id, test_claim)
    
    # Simulated Soter link for this claim
    atlas.add_soter_data(claim_id, {"confidence": 0.98, "status": "verified", "range": "0-500"})
    
    # Perform Logos verification
    logos_result = await logos_engine.verify_proposition(test_claim)
    atlas.add_logos_data(claim_id, logos_result.to_dict())
    
    # 3. Mnemon / Aletheia Source Mapping (Simulated)
    print("\n--- Phase 3: Mnemon Source Mapping ---")
    atlas.add_source_mapping(claim_id, [
        {"source": "IPCC AR6", "snippet": "It is unequivocal that human influence has warmed the atmosphere."},
        {"source": "NOAA", "snippet": "Global surface temperature has increased rapidly since the late 19th century."}
    ])
    
    # 4. Raw Evidence (Simulated)
    print("\n--- Phase 4: Raw Evidence Linkage ---")
    atlas.add_raw_evidence(claim_id, [
        "RAW_DATA_SENS_C01: Mean surface temp anomaly +1.1C",
        "SATELLITE_C-O2_REF: CO2 ppm measurement 417.2"
    ])
    
    print("\n" + "="*50)
    print("FINAL EPISTEMIC ATLAS TRUTH TRACE")
    print("="*50)
    print(atlas.get_full_trace(claim_id).export_markdown())

if __name__ == "__main__":
    # Add paths to ensure imports work during this test
    import sys
    import os
    sys.path.append("/root/.openclaw/workspace/skills")
    asyncio.run(main())
