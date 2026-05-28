import unittest
from infra.mcp.context import AbraxasContext, get_context
from infra.mcp.registry import MCPRegistry
from mcp.server.fastmcp import FastMCP

class TestMCPRegistry(unittest.TestCase):
    def setUp(self):
        self.mcp = FastMCP("test-server")
        self.context = get_context()
        self.registry = MCPRegistry(self.mcp, self.context)

    def test_registry_discovery(self):
        """Test that the registry finds the sovereign_engine tools."""
        self.registry.load_skills()
        registered = self.registry.get_registered_modules()
        
        # Verify sovereign_engine was loaded
        self.assertTrue(any("sovereign_engine.mcp_tools" in mod for mod in registered), 
                        "Sovereign Engine tools should be registered")

    def test_context_path_resolution(self):
        """Test that the context correctly resolves paths."""
        path = self.context.get_path(".abraxas/test")
        self.assertTrue(os.path.isabs(path), "Resolved path should be absolute")

if __name__ == "__main__":
    import os
    unittest.main()
