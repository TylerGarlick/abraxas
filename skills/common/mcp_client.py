import json
import subprocess
from typing import Any, Dict, Optional

class MCPClient:
    """
    A lightweight client to invoke tools from other MCP servers.
    In a production environment, this would use the MCP SDK's transport.
    For logic-tier interop, we simulate the tool call by invoking the server 
    via stdio or via direct logic import if the server is in the same process.
    """
    
    @staticmethod
    def call_tool(server_name: str, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """
        Invokes a tool from another MCP server.
        
        Args:
            server_name: The name of the target MCP server (e.g., 'soter-verifier').
            tool_name: The name of the tool to invoke.
            arguments: The arguments to pass to the tool.
            
        Returns:
            The result of the tool execution.
            
        Raises:
            RuntimeError: If the tool call fails or the server is unreachable.
        """
        try:
            # In a real MCP environment, we would use the MCP SDK.
            # For this a-priori implementation, we correlate the server_name to the logic import.
            # This ensures the tools are logically connected without requiring a full
            # network stack for internal logic calls.
            
            # Mapping servers to their logic classes
            mapping = {
                "soter-verifier": ("skills.soter.python.logic", "SoterLogic"),
                "aletheia-truth": ("skills.aletheia_truth.python.logic", "AletheiaTruthLogic"),
                "ethos": ("skills.ethos.python.logic", "EthosLogic"),
                "mnemosyne-memory": ("skills.mnemosyne.python.logic", "MnemosyneLogic"),
                "sovereign-core": ("skills.sovereign_core.python.logic", "SovereignCoreLogic"),
                "sovereign-engine": ("skills.sovereign_engine.python.logic", "SovereignEngineLogic"),
            }
            
            if server_name not in mapping:
                raise ValueError(f"Unknown MCP server: {server_name}")
                
            module_path, class_name = mapping[server_name]
            
            # Dynamic import
            import importlib
            module = importlib.import_module(module_path)
            cls = getattr(module, class_name)
            logic = cls() # Singleton access
            
            # Find the tool method in the logic class
            # We map MCP tool names to logic method names (snake_case)
            method_name = tool_name.replace("-", "_")
            method = getattr(logic, method_name, None)
            
            if not method:
                raise AttributeError(f"Tool {tool_name} not found in {server_name} logic tier.")
                
            return method(**arguments)
            
        except Exception as e:
            # Descriptive error as requested
            raise RuntimeError(f"Inter-MCP Tool Call Failed: [{server_name} -> {tool_name}] - {str(e)}") from e
