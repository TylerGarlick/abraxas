from typing import List, Dict
import os
import re
import logging
from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext

logger = logging.getLogger("mcp-auditor")

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """
    Registers the Omniscient Auditor's tools into the Abraxas MCP server.
    These tools handle the high-throughput processing that LLMs struggle with.
    """
    
    @mcp.tool()
    def decompose_document(path: str) -> List[Dict]:
        """
        Splits a document into atomic propositions for epistemic auditing.
        Removed narrative fluff and focuses on claims.
        """
        if not os.path.exists(path):
            return [{"error": f"File {path} not found"}]
        
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Simple atomic decomposition: split by sentence/newline
        # In a production environment, this would use a specialized NLP model
        raw_claims = re.split(r'(?<=[.!?])\s+', text)
        
        decomposed = []
        for i, claim in enumerate(raw_claims):
            claim = claim.strip()
            if len(claim) < 10: continue # Ignore very short noise
            
            decomposed.append({
                "id": f"C-{i:03d}",
                "text": claim,
                "line_approx": 0 # In a real impl, we'd track exact line numbers
            })
        
        return decomposed

    @mcp.tool()
    def generate_heat_map(results: List[Dict]) -> str:
        """
        Transforms raw audit results into a Sovereign Heat Map table.
        Expects a list of dicts with keys: 'id', 'text', 'label', 'risk', 'status'.
        """
        header = "| Claim ID | Original Text | Epistemic Label | Soter Risk | CVP Status | Resolution Path |\n"
        divider = "|:---|:---|:---|:---|:---|:---|\n"
        
        rows = []
        for r in results:
            # Truncate long text for the table
            text = r['text'][:80] + "..." if len(r['text']) > 80 else r['text']
            
            # Color-code labels for visual clarity
            label = r.get('label', 'UNKNOWN')
            risk = r.get('risk', '0')
            status = r.get('status', 'Pending')
            path = r.get('path', 'N/A')
            
            rows.append(f"| {r['id']} | {text} | `{label}` | {risk} | {status} | {path} |")
            
        return header + divider + "\n".join(rows)

    # Note: batch_label is handled by the agent looping through the 
    # decomposed list and assigning labels.
