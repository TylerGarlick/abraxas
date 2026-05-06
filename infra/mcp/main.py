from mcp.server.fastmcp import FastMCP
from infra.mcp.context import get_context
from infra.mcp.registry import MCPRegistry
from infra.mcp.db_manager import DBManager

# Initialize the Unified Abraxas OS MCP Server
mcp = FastMCP("abraxas-os")
context = get_context()
registry = MCPRegistry(mcp, context)
db_manager = DBManager(context)

@mcp.tool()
def system_mode_health_check() -> str:
    """
    Determines if the server should be in Sovereign Mode or Simulation Mode.
    Returns 'Sovereign Mode' if all critical systems are online, else 'Simulation Mode'.
    """
    # 1. DB Connectivity
    db_ok = db_manager.connect()
    
    # 2. Skill Registry Status
    skills_loaded = len(registry.get_registered_modules()) > 0
    
    # 3. Basic Filesystem Check
    root_ok = True
    try:
        import os
        os.path.exists(context.root_dir)
    except:
        root_ok = False

    if db_ok and skills_loaded and root_ok:
        return "Sovereign Mode"
    return "Simulation Mode"

def main():
    """Main entry point for the unified MCP server."""
    print("Starting Abraxas Unified MCP Server...")
    
    # Initialize Database
    if db_manager.connect():
        print("Database connection established. Running schema checks...")
        # In a full implementation, we would pass manifests from registry.load_skills() here
        db_manager.initialize_schema([]) 
    else:
        print("Warning: Database connection failed. Server will start in Simulation Mode.")

    # Load all skill-based tools
    registry.load_skills()
    
    print(f"Successfully loaded {len(registry.get_registered_modules())} skill modules.")
    
    # Run the server
    mcp.run()

if __name__ == "__main__":
    main()

