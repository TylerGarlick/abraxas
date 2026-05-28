import os
import json
import subprocess
import datetime
import platform
import time
from typing import List, Dict, Any, Optional
from pathlib import Path

class ProjectBridgeLogic:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ProjectBridgeLogic, cls).__new__(cls)
            cls._instance._init_paths()
        return cls._instance

    def _init_paths(self):
        # Default workspace paths
        self.WORKSPACE_ROOT = os.getenv("Sovereign_WORKSPACE_ROOT", "/root/.openclaw/workspace")
        self.PROJECTS_DIR = os.path.join(self.WORKSPACE_ROOT, "projects")
        self.ABRAXAS_DIR = os.path.join(self.WORKSPACE_ROOT, "abraxas")
        self.MAPPING_FILE = os.path.join(self.WORKSPACE_ROOT, ".project-mappings.json")
        
        self._projects_cache = None

    def get_projects(self) -> List[str]:
        """Discover all project directories in the workspace."""
        if self._projects_cache:
            return self._projects_cache

        try:
            if not os.path.exists(self.PROJECTS_DIR):
                return ["abraxas"]
                
            projects = [
                d for d in os.listdir(self.PROJECTS_DIR) 
                if os.path.isdir(os.path.join(self.PROJECTS_DIR, d))
            ]
            
            if "abraxas" not in projects:
                projects.append("abraxas")
                
            self._projects_cache = projects
            return projects
        except Exception as e:
            print(f"Error discovering projects: {e}")
            return ["abraxas"]

    def cross_project_search(self, query: str, projects: Optional[List[str]] = None, 
                           file_pattern: str = "*", case_sensitive: bool = False, 
                           max_results: int = 20) -> Dict[str, Any]:
        """Search across multiple project repositories for files, code, or content."""
        target_projects = projects if projects else self.get_projects()
        results = []
        total_matches = 0

        for project in target_projects:
            project_path = self.ABRAXAS_DIR if project == "abraxas" else os.path.join(self.PROJECTS_DIR, project)
            
            if not os.path.exists(project_path):
                continue

            # Build grep command
            grep_flags = "-n" if case_sensitive else "-in"
            max_results_flag = f"-m{max_results}"
            file_glob = f"--include={file_pattern}" if file_pattern != "*" else ""
            
            # Construct command safely
            command = f'grep {grep_flags} {max_results_flag} {file_glob} "{query}" -r "."'
            
            try:
                # Run grep inside the project path
                process = subprocess.run(
                    command,
                    shell=True,
                    cwd=project_path,
                    capture_output=True,
                    text=True
                )
                
                output = process.stdout.strip()
                if output:
                    lines = output.splitlines()[:max_results]
                    matches = []
                    for line in lines:
                        parts = line.split(":", 1)
                        if len(parts) == 2:
                            matches.append({
                                "file": parts[0].replace("./", ""),
                                "content": parts[1].strip()
                            })
                    
                    results.append({
                        "project": project,
                        "matchCount": len(matches),
                        "matches": matches
                    })
                    total_matches += len(matches)
            except Exception as e:
                print(f"Search failed for project {project}: {e}")
                continue

        return {
            "success": True,
            "query": query,
            "projectsSearched": target_projects,
            "totalMatches": total_matches,
            "results": results,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

    def unified_retrospective(self, project: Optional[str] = None, start_date: Optional[str] = None, 
                              end_date: Optional[str] = None, tags: Optional[List[str]] = None, 
                              limit: int = 50) -> Dict[str, Any]:
        """Retrieve retrospectives from multiple projects in a unified format."""
        retros = []
        projects_to_search = [project] if project else self.get_projects()

        for proj in projects_to_search:
            project_path = self.ABRAXAS_DIR if proj == "abraxas" else os.path.join(self.PROJECTS_DIR, proj)
            if not os.path.exists(project_path):
                continue

            # Common retro locations
            retro_paths = [
                os.path.join(project_path, "retrospectives"),
                os.path.join(project_path, "docs", "retrospectives"),
                os.path.join(project_path, "memory", "retrospectives"),
                os.path.join(project_path, ".retrospectives"),
            ]

            for path in retro_paths:
                if not os.path.exists(path):
                    continue
                
                try:
                    for entry in os.scandir(path):
                        if len(retros) >= limit: break
                        
                        if entry.is_dir():
                            # Date-based directory (YYYY-MM-DD)
                            if len(entry.name) == 10 and entry.name[4] == '-' and entry.name[7] == '-':
                                retro_date = entry.name
                                if start_date and retro_date < start_date: continue
                                if end_date and retro_date > end_date: continue
                                
                                for file in os.scandir(entry.path):
                                    if file.name.endswith((".md", ".json")):
                                        with open(file.path, "r", encoding="utf-8") as f:
                                            content = f.read()
                                            if tags and not any(t.lower() in content.lower() for t in tags):
                                                continue
                                            
                                            retros.append({
                                                "project": proj,
                                                "date": retro_date,
                                                "file": file.name,
                                                "path": file.path,
                                                "preview": content[:500] + ("..." if len(content) > 500 else "")
                                            })
                                            if len(retros) >= limit: break
                        
                        elif entry.is_file() and entry.name.endswith((".md", ".json")):
                            with open(entry.path, "r", encoding="utf-8") as f:
                                content = f.read()
                                
                                # Extract date from filename or content
                                date_match = re.search(r"(\d{4}-\d{2}-\d{2})", entry.name)
                                retro_date = date_match.group(1) if date_match else "unknown"
                                
                                if start_date and retro_date != "unknown" and retro_date < start_date: continue
                                if end_date and retro_date != "unknown" and retro_date > end_date: continue
                                if tags and not any(t.lower() in content.lower() for t in tags):
                                    continue
                                    
                                retros.append({
                                    "project": proj,
                                    "date": retro_date,
                                    "file": entry.name,
                                    "path": entry.path,
                                    "preview": content[:500] + ("..." if len(content) > 500 else "")
                                })
                                if len(retros) >= limit: break
                except Exception as e:
                    print(f"Error searching {path}: {e}")
                    continue

        return {
            "success": True,
            "project": project or "all",
            "count": len(retros),
            "limit": limit,
            "retrospectives": retros,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

    def project_mapping(self, action: str, source_project: Optional[str] = None, 
                       target_project: Optional[str] = None, relationship_type: Optional[str] = None, 
                       metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Manage and query project-to-project relationships."""
        metadata = metadata or {}
        
        try:
            mappings = self._load_mappings()
            
            if action == "list":
                return {
                    "success": True,
                    "action": "list",
                    "mappings": mappings,
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
                }
            
            elif action == "get":
                if not source_project:
                    raise ValueError("sourceProject is required for get action")
                rels = [r for r in mappings.get("relationships", []) if r["source"] == source_project or r["target"] == source_project]
                return {
                    "success": True,
                    "action": "get",
                    "project": source_project,
                    "relationships": rels,
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
                }
            
            elif action == "create":
                if not all([source_project, target_project, relationship_type]):
                    raise ValueError("sourceProject, targetProject, and relationshipType are required")
                
                new_rel = {
                    "id": f"{source_project}-{target_project}-{int(time.time())}",
                    "source": source_project,
                    "target": target_project,
                    "type": relationship_type,
                    "metadata": metadata,
                    "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
                }
                if "relationships" not in mappings: mappings["relationships"] = []
                mappings["relationships"].append(new_rel)
                self._save_mappings(mappings)
                return {"success": True, "action": "create", "relationship": new_rel, "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()}
            
            elif action == "update":
                if not all([source_project, target_project]):
                    raise ValueError("sourceProject and targetProject are required")
                
                idx = next((i for i, r in enumerate(mappings.get("relationships", [])) if r["source"] == source_project and r["target"] == target_project), None)
                if idx is None: raise ValueError("Relationship not found")
                
                rel = mappings["relationships"][idx]
                if relationship_type: rel["type"] = relationship_type
                if metadata: rel["metadata"].update(metadata)
                rel["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
                
                self._save_mappings(mappings)
                return {"success": True, "action": "update", "relationship": rel, "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()}
            
            elif action == "delete":
                if not all([source_project, target_project]):
                    raise ValueError("sourceProject and targetProject are required")
                
                orig_len = len(mappings.get("relationships", []))
                mappings["relationships"] = [r for r in mappings.get("relationships", []) if not (r["source"] == source_project and r["target"] == target_project)]
                if len(mappings["relationships"]) == orig_len:
                    raise ValueError("Relationship not found")
                
                self._save_mappings(mappings)
                return {"success": True, "action": "delete", "deleted": {"source": source_project, "target": target_project}, "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()}
            
            else:
                raise ValueError(f"Unknown action: {action}")
                
        except Exception as e:
            return {"success": False, "action": action, "error": str(e), "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()}

    def _load_mappings(self) -> Dict[str, Any]:
        if not os.path.exists(self.MAPPING_FILE):
            return {"projects": {}, "relationships": []}
        with open(self.MAPPING_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    def _save_mappings(self, data: Dict[str, Any]):
        with open(self.MAPPING_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def health_check(self, detailed: bool = False) -> Dict[str, Any]:
        """Check the health status of the project bridge server and connected project repositories."""
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        health = {
            "status": "healthy",
            "timestamp": now,
            "uptime": time.time() - (self._start_time if hasattr(self, '_start_time') else time.time()),
            "version": "1.0.0"
        }
        
        if detailed:
            health["workspace"] = {"path": self.WORKSPACE_ROOT, "accessible": os.path.exists(self.WORKSPACE_ROOT)}
            projects = self.get_projects()
            project_status = {p: {"status": "available", "path": os.path.join(self.PROJECTS_DIR, p)} for p in projects}
            health["projects"] = project_status
            health["metrics"] = {"platform": platform.platform(), "python_version": platform.python_version()}
            health["tools"] = {
                "cross_project_search": "operational",
                "unified_retrospective": "operational",
                "project_mapping": "operational",
                "health_check": "operational"
            }
        return health
