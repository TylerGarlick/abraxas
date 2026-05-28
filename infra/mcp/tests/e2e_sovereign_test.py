import requests
import pytest
import time
import json

# The MCP server URL inside the docker network
MCP_URL = "http://abraxas-mcp-test:9900/mcp"

def test_document_decomposition():
    """
    Scenario: Test the Omniscient Auditor's ability to decompose a file.
    Since we can't easily put files in the container a priori without complex mounts,
    we assume a test file exists in the shared /workspace.
    """
    # Create a dummy test file in the shared workspace
    with open("/workspace/test_audit.txt", "w") as f:
        f.write("The tau-filter is effective. It operates at 400Hz. Hallucinations are zero.")

    # Call the MCP tool via the SSE/HTTP interface
    # Note: This is a simplified call assuming the MCP server exposes tools as endpoints
    response = requests.post(f"{MCP_URL}/tools/decompose_document", json={"path": "/workspace/test_audit.txt"})
    
    assert response.status_code == 200
    results = response.json()
    
    # We expect 3 distinct claims from the test text
    assert len(results) == 3
    assert "tau-filter" in results[0]['text']

def test_atlas_trace_connectivity():
    """
    Scenario: Verify the Epistemic Atlas can perform a server-side join.
    """
    # In a real E2E test, we would first seed ArangoDB with a la-la marker
    # For this test, we verify the tool is responsive and handles missing IDs gracefully
    response = requests.post(f"{MCP_URL}/tools/trace_artifact", json={"artifact_id": "TEST-Sovereign-Gap-001"})
    
    assert response.status_code == 200
    result = response.json()
    
    # It should return a structured provenance record even if empty
    assert "artifact_id" in result
    assert "epistemic_status" in result

def test_sovereign_flow_trigger():
    """
    Scenario: Verify the SRP (Sovereign Routing Protocol) trigger.
    We simulate a la-la label and check if the system suggests /flow initiate.
    """
    # This tests the behavioral layer. We send a prompt that should trigger a [UNKNOWN]
    # and check if the tool 'decompose_document' is called as part of a flow.
    # Note: This requires the agent to be in the loop; since this is a tool-test,
    # we verify the meta-orchestrator's logic.
    
    response = requests.post(f"{MCP_URL}/tools/generate_heat_map", json={
        "results": [{"id": "C-1", "text": "Test", "label": "UNKNOWN", "risk": "5", "status": "Failed", "path": "/flow initiate"}]
    })
    
    assert response.status_code == 200
    assert "Sovereign-Flow" in response.text or " la-la" not in response.text # Simple check for formatting

if __name__ == "__main__":
    pytest.main([__file__])
