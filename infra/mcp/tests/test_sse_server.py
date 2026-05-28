import unittest
from unittest.mock import MagicMock, patch
import sys


class TestSSEServerInit(unittest.TestCase):
    def setUp(self):
        pass

    def test_mcp_instance_creates_sse_app(self):
        from mcp.server.fastmcp import FastMCP
        mcp = FastMCP("test")
        sse_app = mcp.sse_app()
        self.assertIsNotNone(sse_app)

    def test_fastmcp_tool_registration(self):
        from mcp.server.fastmcp import FastMCP
        mcp = FastMCP("test")

        @mcp.tool()
        def echo(msg: str) -> str:
            return msg

        @mcp.tool()
        def add(a: int, b: int) -> int:
            return a + b

        self.assertTrue(hasattr(mcp, "_tool_manager"))

    @patch("infra.mcp.db_manager.DBManager.connect", return_value=False)
    @patch("infra.mcp.registry.MCPRegistry.load_skills", return_value=None)
    @patch("infra.mcp.registry.MCPRegistry.get_registered_modules", return_value=[])
    @patch("infra.mcp.context.AbraxasContext.get_env")
    def test_system_mode_returns_simulation_when_db_fails(
        self, mock_get_env, mock_modules, mock_load, mock_connect
    ):
        mock_get_env.return_value = "fake_value"
        from infra.mcp.main import system_mode_health_check
        result = system_mode_health_check()
        self.assertEqual(result, "Simulation Mode")

    @patch("infra.mcp.db_manager.DBManager.connect", return_value=True)
    @patch("infra.mcp.registry.MCPRegistry.load_skills", return_value=None)
    @patch("infra.mcp.registry.MCPRegistry.get_registered_modules", return_value=["skill1"])
    @patch("infra.mcp.context.AbraxasContext.get_env")
    def test_system_mode_returns_sovereign_when_all_ok(
        self, mock_get_env, mock_modules, mock_load, mock_connect
    ):
        mock_get_env.return_value = "fake_value"
        from infra.mcp.main import system_mode_health_check
        result = system_mode_health_check()
        self.assertEqual(result, "Sovereign Mode")


class TestHealthApp(unittest.TestCase):
    @patch("infra.mcp.db_manager.DBManager.connect", return_value=True)
    @patch("infra.mcp.registry.MCPRegistry.get_registered_modules", return_value=["s1"])
    def test_health_returns_sovereign_mode(self, mock_modules, mock_connect):
        from fastapi.testclient import TestClient
        from infra.mcp.main import health_app

        client = TestClient(health_app)
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "Sovereign Mode")
        self.assertEqual(data["db"], "connected")

    @patch("infra.mcp.db_manager.DBManager.connect", return_value=False)
    @patch("infra.mcp.registry.MCPRegistry.get_registered_modules", return_value=[])
    def test_health_returns_simulation_mode(self, mock_modules, mock_connect):
        from fastapi.testclient import TestClient
        from infra.mcp.main import health_app

        client = TestClient(health_app)
        response = client.get("/health")
        self.assertEqual(response.status_code, 503)
        data = response.json()
        self.assertEqual(data["status"], "Simulation Mode")


if __name__ == "__main__":
    unittest.main()
