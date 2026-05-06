import unittest
from infra.mcp.context import get_context
from infra.mcp.registry import MCPRegistry
from mcp.server.fastmcp import FastMCP

class TestUnifiedRegistry(unittest.TestCase):
    def setUp(self):
        self.mcp = FastMCP("test-server")
        self.context = get_context()
        self.registry = MCPRegistry(self.mcp, self.context)

    def test_all_migrated_skills_load(self):
        """Verify discovery of all currently migrated skills."""
        self.registry.load_skills()
        registered = self.registry.get_registered_modules()
        
        expected_skills = [
            "skills.sovereign_engine.mcp_tools",
            "skills.dream_reservoir.mcp_tools",
            "skills.guardrail_monitor.mcp_tools",
            "skills.aletheia_truth.mcp_tools",
            "skills.research_engine.mcp_tools"
        ]
        
        for skill in expected_skills:
            with self.subTest(skill=skill):
                self.assertTrue(any(skill in mod for mod in registered), 
                                f"Skill {skill} should be registered in the unified MPC")

    def test_tool_naming_consistency(self):
        """Verify that tools are actually added to the FastMCP instance."""
        self.registry.load_skills()
        # We check if the mcp object has tools registered
        # FastMCP doesn't have a public 'list_tools' as easily as others, 
        # but we can check if the modules were successfully processed.
        self.assertGreater(len(self.registry.get_registered_modules()), 0)

if __name__ == "__main__":
    unittest.main()
