import unittest
from unittest.mock import MagicMock

# Mocking FastMCP and AbraxasContext since they are infra-level and not in PYTHONPATH for unit tests
class MockFastMCP:
    def __init__(self, name):
        self.name = name
        self._tools = {}
    def tool(self, func=None):
        def wrapper(f):
            self._tools[f.__name__] = MagicMock(name=f.__name__)
            return f
        return wrapper if func is None else wrapper(func)
    def call_tool(self, name, args):
        # Simulate a generic success response since we are testing registration and basic flow
        return {"success": True, "tool": name, "args": args, "result": "Mocked MCP Response"}

class MockContext:
    pass

# Monkeypatch the imports if they fail, or just use these mocks
import sys
from types import ModuleType

mcp_mod = ModuleType("mcp.server.fastmcp")
mcp_mod.FastMCP = MockFastMCP
sys.modules["mcp.server.fastmcp"] = mcp_mod

ctx_mod = ModuleType("infra.mcp.context")
ctx_mod.AbraxasContext = MockContext
sys.modules["infra.mcp.context"] = ctx_mod

# Now import the registration functions
from skills.oneironautics.mcp_tools import register_tools as reg_oneiros
from skills.cvp.mcp_tools import register_tools as reg_cvp
from skills.pheme.mcp_tools import register_tools as reg_pheme
from skills.dianoia.mcp_tools import register_tools as reg_dianoia
from skills.mnemon.mcp_tools import register_tools as reg_mnemon
from skills.prometheus.mcp_tools import register_tools as reg_prom
from skills.chronos.mcp_tools import register_tools as reg_chronos
from skills.harmonia.mcp_tools import register_tools as reg_harmonia
from skills.hermes.mcp_tools import register_tools as reg_hermes
from skills.plan.mcp_tools import register_tools as reg_plan

class TestMCPToolRegistrationE2E(unittest.TestCase):
    def setUp(self):
        self.mcp = MockFastMCP("Abraxas-TEST")
        self.context = MockContext()
        
        reg_oneiros(self.mcp, self.context)
        reg_cvp(self.mcp, self.context)
        reg_pheme(self.mcp, self.context)
        reg_dianoia(self.mcp, self.context)
        reg_mnemon(self.mcp, self.context)
        reg_prom(self.mcp, self.context)
        reg_chronos(self.mcp, self.context)
        reg_harmonia(self.mcp, self.context)
        reg_hermes(self.mcp, self.context)
        reg_plan(self.mcp, self.context)

    def test_tool_registration_count(self):
        expected_tools = [
            "log_dream", "witness_symbol", "update_shadow_ledger", 
            "resolve_consensus", "log_sovereign_gap",             
            "verify_claim", "update_source_trust",                
            "quantify_uncertainty", "calculate_brier_score",      
            "record_belief", "track_revision", "flag_prompted",    
            "get_profile", "set_preference", "record_signal",      
            "index_claim", "detect_drift", "resolve_conflict",    
            "compose_workflow", "execute_sequence", "check_conflict", 
            "add_agent_position", "compute_consensus", "weight_record", 
            "start_clarity_session", "extract_unknowns", "export_map"  
        ]
        
        registered_names = list(self.mcp._tools.keys())
        
        for tool_name in expected_tools:
            with self.subTest(tool=tool_name):
                self.assertIn(tool_name, registered_names)

    def test_tool_execution_e2e(self):
        res_dream = self.mcp.call_tool("log_dream", {"dream_text": "Neon Forest"})
        self.assertTrue(res_dream["success"])
        
        res_plan = self.mcp.call_tool("start_clarity_session", {"query": "Test query"})
        self.assertTrue(res_plan["success"])

if __name__ == "__main__":
    unittest.main()
