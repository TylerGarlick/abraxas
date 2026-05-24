import json
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

@dataclass
class EpistemicTrace:
    """
    The Epistemic Atlas Trace: maps a final claim back to its raw evidence.
    Final Claim -> Soter Verification -> Logos Symbolic Proof -> Mnemon/Aletheia Source Mapping -> Raw Evidence.
    """
    claim_id: str
    final_claim: str
    
    # 1. Soter Verification (The a-priori / statistical audit)
    soter_verification: Dict[str, Any] = field(default_factory=dict)
    
    # 2. Logos Symbolic Proof (The deductive/logical chain)
    logos_proof: Dict[str, Any] = field(default_factory=dict)
    
    # 3. Mnemon/Aletheia Source Mapping (The semantic retrieval link)
    source_mapping: List[Dict[str, Any]] = field(default_factory=list)
    
    # 4. Raw Evidence (The ground truth)
    raw_evidence: List[str] = field(default_factory=list)
    
    metadata: Dict[str, Any] = field(default_factory=dict)

    def export_json(self) -> str:
        """Export the trace to a JSON format for human auditors."""
        return json.dumps(asdict(self), indent=2)

    def export_markdown(self) -> str:
        """Export the trace to a Markdown format for human auditors."""
        md = f"# Epistemic Trace: {self.claim_id}\n\n"
        md += f"**Final Claim:** {self.final_claim}\n\n"
        
        md += "## 🛡️ Soter Verification\n"
        md += f"- Confidence: {self.soter_verification.get('confidence', 'N/A')}\n"
        md += f"- Status: {self.soter_verification.get('status', 'N/A')}\n"
        md += f"- Audit Range: {self.soter_verification.get('range', 'N/A')}\n\n"
        
        md += "## ⚖️ Logos Symbolic Proof\n"
        md += f"- Proposition: {self.logos_proof.get('proposition_text', 'N/A')}\n"
        md += f"- Status: {self.logos_proof.get('status', 'N/A')}\n"
        md += f"- Logic Chain: {self.logos_proof.get('weighted_support', 'N/A')} support / {self.logos_proof.get('weighted_contradict', 'N/A')} contradict\n\n"
        
        md += "## 📚 Source Mapping (Mnemon/Aletheia)\n"
        for i, mapping in enumerate(self.source_mapping, 1):
            md += f"{i}. Source: {mapping.get('source', 'Unknown')} | Snippet: {mapping.get('snippet', 'N/A')}\n"
        
        md += "\n## 📄 Raw Evidence\n"
        for i, evidence in enumerate(self.raw_evidence, 1):
            md += f"--- Evidence {i} ---\n`{evidence}`\n\n"
            
        return md

class EpistemicAtlas:
    """
    The Unified Tracing Layer for Abraxas v4.6.
    Integrates Soter, Logos, and Mnemon/Aletheia into a single provenance chain.
    """
    def __init__(self):
        self.atlas: Dict[str, EpistemicTrace] = {}

    def create_trace(self, claim_id: str, claim_text: str) -> EpistemicTrace:
        trace = EpistemicTrace(claim_id=claim_id, final_claim=claim_text)
        self.atlas[claim_id] = trace
        return trace

    def add_soter_data(self, claim_id: str, soter_result: Dict[str, Any]):
        if claim_id in self.atlas:
            self.atlas[claim_id].soter_verification = soter_result

    def add_logos_data(self, claim_id: str, logos_result: Dict[str, Any]):
        if claim_id in self.atlas:
            self.atlas[claim_id].logos_proof = logos_result

    def add_source_mapping(self, claim_id: str, mappings: List[Dict[str, Any]]):
        if claim_id in self.atlas:
            self.atlas[claim_id].source_mapping.extend(mappings)

    def add_raw_evidence(self, claim_id: str, evidence: List[str]):
        if claim_id in self.atlas:
            self.atlas[claim_id].raw_evidence.extend(evidence)

    def get_full_trace(self, claim_id: str) -> Optional[EpistemicTrace]:
        return self.atlas.get(claim_id)

    def export_atlas(self, format: str = "json") -> str:
        """Exports all traces in the atlas."""
        if format == "json":
            return json.dumps({k: asdict(v) for k, v in self.atlas.items()}, indent=2)
        elif format == "markdown":
            md_reports = [v.export_markdown() for v in self.atlas.values()]
            return "\n\n---\n\n".join(md_reports)
        return "Unsupported format"

# Integration Example / Test
if __name__ == "__main__":
    atlas = EpistemicAtlas()
    
    # Scenario: Auditing a claim about climate change
    claim_id = "CLAIM-2026-001"
    claim_text = "Climate change is primarily caused by human activities"
    
    trace = atlas.create_trace(claim_id, claim_text)
    
    # 1. Soter Data (Simulated output from OmniscientAuditor)
    atlas.add_soter_data(claim_id, {
        "confidence": 0.92,
        "status": "verified",
        "range": "1200-1500"
    })
    
    # 2. Logos Data (Simulated output from CrossSourceVerificationEngine)
    atlas.add_logos_data(claim_id, {
        "proposition_text": claim_text,
        "status": "verified",
        "weighted_support": 3.1,
        "weighted_contradict": 0.0
    })
    
    # 3. Mnemon Mapping
    atlas.add_source_mapping(claim_id, [
        {"source": "IPCC Report 2023", "snippet": "Human influence has warmed the atmosphere..."},
        {"source": "NASA Global Climate", "snippet": "The current warming trend is of unprecedented scale..."}
    ])
    
    # 4. Raw Evidence
    atlas.add_raw_evidence(claim_id, [
        "SATELLITE_DATA_REF_992: Mean temp increase 1.1C since 1880",
        "ICE_CORE_SAMP_A12: CO2 levels exceed 400ppm for first time in 800k years"
    ])
    
    print("--- Truth Trace Export (Markdown) ---")
    print(atlas.get_full_trace(claim_id).export_markdown())
