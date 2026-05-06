import importlib
import os
import glob
import logging
from typing import List, Callable
from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mcp-registry")

class MCPRegistry:
    """
    Discovers and registers tools from skill-specific mcp_tools.py files.
    """
    def __init__(self, mcp: FastMCP, context: AbraxasContext):
        self.mcp = mcp
        self.context = context
        self.registered_tools: List[str] = []

    def load_skills(self):
        """Scans the skills directory and loads all mcp_tools.py files."""
        # search for skills/*/mcp_tools.py
        search_pattern = os.path.join(self.context.root_dir, "skills", "*", "mcp_tools.py")
        files = glob.glob(search_pattern)
        
        logger.info(f"Found {len(files)} skill tool files to load.")
        
        for file_path in files:
            self._load_tool_file(file_path)

    def _load_tool_file(self, file_path: str):
        """Dynamically imports and executes registration for a tool file."""
        try:
            # Convert path to module notation: skills.skill_name.mcp_tools
            rel_path = os.path.relpath(file_path, self.context.root_dir)
            module_path = rel_path.replace(os.path.sep, ".").replace(".py", "")
            
            logger.info(f"Loading module: {module_path}")
            module = importlib.import_module(module_path)
            
            # Look for a 'register_tools' function in the module
            if hasattr(module, "register_tools"):
                module.register_tools(self.mcp, self.context)
                self.registered_tools.append(module_path)
                logger.info(f"Successfully registered tools from {module_path}")
            else:
                logger.warning(f"Module {module_path} does not have a register_tools function.")
        except Exception as e:
            logger.error(f"Failed to load tool file {file_path}: {str(e)}")

    def get_registered_modules(self) -> List[str]:
        return self.registered_tools
