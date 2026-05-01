import os
import json
import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

class RetrospectivesLogic:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RetrospectivesLogic, cls).__new__(cls)
            cls._instance._init_paths()
        return cls._instance

    def _init_paths(self):
        # Default base directory for retrospectives
        self.RETRO_BASE_DIR = os.getenv("Sovereign_RETRO_DIR", os.path.expanduser("~/.abraxas/retrospectives"))
        
    def _get_storage_path(self, date: str, retro_type: str, retro_id: str) -> tuple:
        """Calculate folder and file paths based on ISO date and ID."""
        try:
            year, month, day = date.split('-')
            folder = os.path.join(self.RETRO_BASE_DIR, year, month, day)
            file_path = os.path.join(folder, f"{retro_type}_{retro_id}.json")
            return folder, file_path
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")

    def save_retro(self, date: str, retro_type: str, retro_id: str, content: Dict[str, Any]) -> str:
        """Save a retrospective assessment to the filesystem."""
        folder, file_path = self._get_storage_path(date, retro_type, retro_id)
        
        try:
            os.makedirs(folder, exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(content, f, indent=2)
            return f"Retrospective saved to {file_path}"
        except Exception as e:
            raise RuntimeError(f"Error saving retrospective: {str(e)}")

    def get_retros_for_period(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Retrieve retrospectives within a given date range."""
        results = []
        
        # We walk the directory tree: root -> year -> month -> day
        if not os.path.exists(self.RETRO_BASE_DIR):
            return []

        try:
            for year in sorted(os.listdir(self.RETRO_BASE_DIR)):
                if not year.isdigit() or len(year) != 4: continue
                year_path = os.path.join(self.RETRO_BASE_DIR, year)
                if not os.path.isdir(year_path): continue
                
                for month in sorted(os.listdir(year_path)):
                    month_path = os.path.join(year_path, month)
                    if not os.path.isdir(month_path): continue
                    
                    for day in sorted(os.listdir(month_path)):
                        retro_date = f"{year}-{month.zfill(2)}-{day.zfill(2)}"
                        if start_date <= retro_date <= end_date:
                            day_path = os.path.join(month_path, day)
                            if not os.path.isdir(day_path): continue
                            
                            for file in os.listdir(day_path):
                                if file.endswith(".json"):
                                    with open(os.path.join(day_path, file), "r", encoding="utf-8") as f:
                                        results.append(json.load(f))
        except Exception as e:
            raise RuntimeError(f"Error retrieving retros: {str(e)}")
            
        return results

    def create_ledger_task(self, description: str, priority: str, source_retro_id: str) -> str:
        """Create a task in the retrospective ledger."""
        ledger_path = os.path.join(self.RETRO_BASE_DIR, "ledger.json")
        
        try:
            ledger = []
            if os.path.exists(ledger_path):
                with open(ledger_path, "r", encoding="utf-8") as f:
                    ledger = json.load(f)
            
            ledger.append({
                "description": description,
                "priority": priority,
                "source_retro_id": source_retro_id,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
            })
            
            with open(ledger_path, "w", encoding="utf-8") as f:
                json.dump(ledger, f, indent=2)
                
            return f"Ledger task created: {description} (Source: {source_retro_id})"
        except Exception as e:
            raise RuntimeError(f"Error updating ledger: {str(e)}")
