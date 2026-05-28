from typing import List, Dict, Any, Optional
import logging
from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext

logger = logging.getLogger("mcp-atlas")

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """
    Registers the Epistemic Atlas tools. 
    Allows for server-side joins across Mnemon, Mnemosyne, and the Janus Ledger.
    """

    @mcp.tool()
    def trace_artifact(artifact_id: str) -> Dict[str, Any]:
        """
        Traces a claim's provenance across the Sovereign Brain.
        Joins Mnemon beliefs, Mnemosyne sessions, and Janus Ledger entries.
        """
        # we use the context.db_manager to access ArangoDB
        from infra.mcp.main import db_manager
        db = db_manager.db
        
        if not db:
            return {"error": "Database connection not active"}

        try:
            # 1. Search for the artifact in the epistemic_ledger
            # Pattern: jl-{date}-{uuid}
            ledger_query = f'FOR doc IN epistemic_ledger FILTER doc.id == "{artifact_id}" RETURN doc'
            ledger_res = db.aql.execute(ledger_query)
            ledger_entry = ledger_res.next() if ledger_res.count() > 0 else None

            # 2. Look for related beliefs in Mnemon (using artifact_id as a link)
            belief_query = f'FOR b IN knowledge_fragments FILTER b.artifact_id == "{artifact_id}" RETURN b'
            belief_res = db.aql.execute(belief_query)
            belief_entry = belief_res.next() if belief_res.count() > 0 else None

            # 3. Resolve session provenance in Mnemosyne
            session_id = None
            if ledger_entry:
                session_id = ledger_entry.get('session_id')

            return {
                "artifact_id": artifact_id,
                "epistemic_status": ledger_entry.get('label') if ledger_entry else "Unknown",
                "belief_state": belief_entry.get('value') if belief_entry else "No belief linked",
                "provenance_session": session_id,
                "confidence_score": ledger_entry.get('confidence') if ledger_entry else "N/A"
            }
        except Exception as e:
            logger.error(f"Atlas trace failed: {str(e)}")
            return {"error": f"Atlas trace failure: {str(e)}"}

    @mcp.tool()
    def query_epistemic_map(topic: str) -> List[Dict[str, Any]]:
        """
        Performs a joined query across the Sovereign brain to map a topic.
        Returns all beliefs, labels, and risks associated with the topic.
        """
        from infra.mcp.main import db_manager
        db = db_manager.db
        
        if not db:
            return [{"error": "Database connection not active"}]

        try:
            # AQL Join: Find beliefs related to the topic and join with ledger status
            # This is a simplified version of the graph join
            aql = """
            FOR belief IN knowledge_fragments
                FILTER CONTAINS(belief.value, @topic)
                LET status = FIRST(
                    FOR ledger IN epistemic_ledger 
                    FILTER ledger.artifact_id == belief.artifact_id 
                    RETURN ledger
                )
                RETURN {
                    belief: belief.value,
                    label: status.label,
                    risk: status.risk,
                    artifact: belief.artifact_id
                }
            """
            cursor = db.aql.execute(aql, bind_vars={'@topic': topic})
            return [doc for doc in cursor]
        except Exception as e:
            logger.error(f"Epistemic map query failed: {str(e)}")
            return [{"error": f"Atlas query failure: {str(e)}"}]
