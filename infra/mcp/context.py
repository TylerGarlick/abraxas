import os
from typing import Any, Optional
from dataclasses import dataclass

@dataclass
class AbraxasContext:
    """
    Shared state and resource manager for the Unified Abraxas MCP.
    Handles database connections and absolute path resolutions.
    """
    root_dir: str
    graph_client: Any = None
    alethia_client: Any = None
    krisis_client: Any = None

    def get_path(self, relative_path: str) -> str:
        """Resolves a path relative to the project root."""
        return os.path.abspath(os.path.join(self.root_dir, relative_path))

    def get_env(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """Retrieves environment variables."""
        return os.environ.get(key, default)

def get_context() -> AbraxasContext:
    """Returns a singleton instance of the context."""
    # Default to /workspace for docker or current dir for local
    root = os.environ.get("ABRAXAS_ROOT", os.getcwd())
    return AbraxasContext(root_dir=root)
