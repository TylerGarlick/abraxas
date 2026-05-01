import pytest
import json
import os
from unittest.mock import patch, MagicMock
from skills.project_bridge.python.logic import ProjectBridgeLogic

@pytest.fixture
def bridge():
    # Reset singleton for tests
    ProjectBridgeLogic._instance = None
    # Mock workspace paths to a temp directory
    with patch.dict("os.environ", {"Sovereign_WORKSPACE_ROOT": "/tmp/abraxas_test_workspace"}):
        # Create temp workspace structure
        os.makedirs("/tmp/abraxas_test_workspace/projects/proj1", exist_ok=True)
        os.makedirs("/tmp/abraxas_test_workspace/abraxas", exist_ok=True)
        
        # Create a dummy file for search
        with open("/tmp/abraxas_test_workspace/projects/proj1/test.txt", "w") as f:
            f.write("Hello Sovereign World")
            
        # Create a dummy retrospective
        retro_dir = "/tmp/abraxas_test_workspace/projects/proj1/retrospectives/2026-01-01"
        os.makedirs(retro_dir, exist_ok=True)
        with open(f"{retro_dir}/retro.md", "w") as f:
            f.write("Date: 2026-01-01\nTag: #success\nThis was a great project.")
            
        return ProjectBridgeLogic()

def test_get_projects(bridge):
    projects = bridge.get_projects()
    assert "abraxas" in projects
    assert "proj1" in projects

def test_cross_project_search(bridge):
    result = bridge.cross_project_search("Sovereign", projects=["proj1"])
    assert result["success"] is True
    assert result["totalMatches"] == 1
    assert result["results"][0]["project"] == "proj1"
    assert "test.txt" in result["results"][0]["matches"][0]["file"]

def test_unified_retrospective(bridge):
    result = bridge.unified_retrospective(project="proj1")
    assert result["success"] is True
    assert len(result["retrospectives"]) == 1
    assert result["retrospectives"][0]["date"] == "2026-01-01"
    assert "This was a great project" in result["retrospectives"][0]["preview"]

def test_project_mapping_create_get(bridge):
    # Use a temporary mapping file path for tests
    bridge.MAPPING_FILE = "/tmp/abraxas_test_mappings.json"
    
    # Create
    bridge.project_mapping(
        action="create", 
        source_project="proj1", 
        target_project="proj2", 
        relationship_type="depends_on"
    )
    
    # Get
    result = bridge.project_mapping(action="get", source_project="proj1")
    assert len(result["relationships"]) == 1
    assert result["relationships"][0]["target"] == "proj2"

def test_health_check(bridge):
    result = bridge.health_check(detailed=True)
    assert result["status"] == "healthy"
    assert "projects" in result
    assert "proj1" in result["projects"]
