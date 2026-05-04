from mcp.server.fastmcp import FastMCP
from python.logic import ResearchEngineLogic

mcp = FastMCP("research-engine")
logic = ResearchEngineLogic()

@mcp.tool()
def web_search(query: str, max_results: int = 10) -> str:
    """Search the web for current information on a topic."""
    result = logic.web_search(query, max_results)
    return str(result)

@mcp.tool()
def web_fetch(url: str, extract_links: bool = False) -> str:
    """Fetch and extract content from a specific URL."""
    result = logic.web_fetch(url, extract_links)
    return str(result)

@mcp.tool()
def synthesize_report(topic: str, sources: list, report_format: str = "comprehensive") -> str:
    """Synthesize information from multiple sources into a coherent report."""
    result = logic.synthesize_report(topic, sources, report_format)
    return str(result)

@mcp.tool()
def deep_dive_research(research_question: str, max_iterations: int = 3, require_verification: bool = True, focus_areas: list = []) -> str:
    """Perform iterative deep-dive research with verification."""
    result = logic.deep_dive_research(research_question, max_iterations, require_verification, focus_areas)
    return str(result)

@mcp.tool()
def health_check(verbose: bool = False) -> str:
    """Check the health status of the research engine server."""
    result = logic.health_check(verbose)
    return str(result)
