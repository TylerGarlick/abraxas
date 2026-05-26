#!/usr/bin/env python3
"""
Aletheia: Longitudinal Calibration Tracker
Tracks model confidence calibration over time
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Optional

DATA_FILE = Path(__file__).parent / "aletheia_data.json"


class AletheiaTracker:
    """Track and analyze model calibration over time"""
    
    def __init__(self, data_file: Path = None):
        self.data_file = data_file or DATA_FILE
        self.data = self._load_data()
    
    def _load_data(self) -> dict:
        """Load existing data or create new"""
        if self.data_file.exists():
            with open(self.data_file) as f:
                return json.load(f)
        return {
            "entries": [],
            "created": datetime.now().isoformat(),
            "model": None
        }
    
    def _save_data(self):
        """Save data to file"""
        with open(self.data_file, "w") as f:
            json.dump(self.data, f, indent=2)
    
    def record_claim(
        self,
        query: str,
        response_type: str,  # fact, inference, speculation, creative
        claimed_confidence: str,  # KNOWN, INFERRED, UNCERTAIN, UNKNOWN, DREAM
        actual_accuracy: Optional[bool] = None,
        notes: str = ""
    ):
        """Record a single claim for tracking"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "query": query[:200],  # Truncate long queries
            "response_type": response_type,
            "claimed_confidence": claimed_confidence,
            "actual_accuracy": actual_accuracy,
            "notes": notes
        }
        
        self.data["entries"].append(entry)
        self._save_data()
        return entry
    
    def record_verification(
        self,
        query: str,
        claimed_confidence: str,
        actual_accuracy: bool,
        notes: str = ""
    ):
        """Record verification of a previous claim"""
        # Find the most recent matching entry
        for entry in reversed(self.data["entries"]):
            if entry["query"] == query[:200]:
                entry["actual_accuracy"] = actual_accuracy
                entry["verified_at"] = datetime.now().isoformat()
                entry["notes"] = notes
                break
        
        self._save_data()
    
    def get_calibration_report(self) -> dict:
        """Generate calibration report"""
        entries = self.data["entries"]
        
        if not entries:
            return {
                "total_claims": 0,
                "known_accuracy": None,
                "inferred_accuracy": None,
                "uncertain_appropriateness": None,
                "calibration_score": None,
                "message": "No data yet"
            }
        
        # Categorize entries
        known_entries = [e for e in entries if e.get("claimed_confidence") == "KNOWN" and e.get("actual_accuracy") is not None]
        inferred_entries = [e for e in entries if e.get("claimed_confidence") == "INFERRED" and e.get("actual_accuracy") is not None]
        uncertain_entries = [e for e in entries if e.get("claimed_confidence") == "UNCERTAIN" and e.get("actual_accuracy") is not None]
        
        # Calculate accuracies
        known_accuracy = sum(1 for e in known_entries if e["actual_accuracy"]) / len(known_entries) * 100 if known_entries else None
        inferred_accuracy = sum(1 for e in inferred_entries if e["actual_accuracy"]) / len(inferred_entries) * 100 if inferred_entries else None
        
        # For uncertain, we want to know if uncertainty was appropriate
        # If actual_accuracy is True, model appropriately expressed uncertainty about something true
        # If actual_accuracy is False, model appropriately expressed uncertainty about something false
        if uncertain_entries:
            # "Appropriate" = model was right about being uncertain
            uncertain_appropriateness = sum(1 for e in uncertain_entries if e["actual_accuracy"] in [True, False]) / len(uncertain_entries) * 100
        else:
            uncertain_appropriateness = None
        
        # Overall calibration score
        valid_scores = [s for s in [known_accuracy, inferred_accuracy, uncertain_appropriateness] if s is not None]
        calibration_score = sum(valid_scores) / len(valid_scores) if valid_scores else None
        
        return {
            "total_claims": len(entries),
            "verified_claims": len([e for e in entries if e.get("actual_accuracy") is not None]),
            "known_count": len(known_entries),
            "known_accuracy": known_accuracy,
            "inferred_count": len(inferred_entries),
            "inferred_accuracy": inferred_accuracy,
            "uncertain_count": len(uncertain_entries),
            "uncertain_appropriateness": uncertain_appropriateness,
            "calibration_score": calibration_score,
            "first_entry": entries[0]["timestamp"] if entries else None,
            "last_entry": entries[-1]["timestamp"] if entries else None
        }
    
    def get_drift_analysis(self, window_days: int = 7) -> dict:
        """Analyze calibration drift over time"""
        entries = self.data["entries"]
        
        if len(entries) < 2:
            return {"message": "Not enough data for drift analysis"}
        
        # Group by time windows
        from datetime import timedelta
        
        now = datetime.now()
        cutoff = now - timedelta(days=window_days)
        
        recent_entries = [e for e in entries if datetime.fromisoformat(e["timestamp"].replace("Z", "+00:00")) > cutoff]
        older_entries = [e for e in entries if datetime.fromisoformat(e["timestamp"].replace("Z", "+00:00")) <= cutoff]
        
        def calc_score(entry_list):
            verified = [e for e in entry_list if e.get("actual_accuracy") is not None]
            if not verified:
                return None
            return sum(1 for e in verified if e["actual_accuracy"]) / len(verified) * 100
        
        recent_score = calc_score(recent_entries)
        older_score = calc_score(older_entries)
        
        if recent_score is None or older_score is None:
            return {"message": "Not enough verified entries for drift analysis"}
        
        return {
            "window_days": window_days,
            "recent_score": recent_score,
            "older_score": older_score,
            "drift": recent_score - older_score,
            "trend": "improving" if recent_score > older_score else "degrading" if recent_score < older_score else "stable"
        }
    
    def export_csv(self, output_file: str = None):
        """Export data to CSV for external analysis"""
        import csv
        
        output_file = output_file or "aletheia_export.csv"
        
        with open(output_file, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["timestamp", "query", "response_type", "claimed_confidence", "actual_accuracy", "notes"])
            writer.writeheader()
            for entry in self.data["entries"]:
                writer.writerow(entry)
        
        return output_file


def demo():
    """Demo usage"""
    tracker = AletheiaTracker()
    
    # Record some test data
    test_claims = [
        ("What is the capital of Australia?", "fact", "KNOWN", True, "Canberra is correct"),
        ("What is the chemical symbol for gold?", "fact", "KNOWN", True, "Au is correct"),
        ("Is there life on Mars?", "speculation", "UNCERTAIN", True, "No confirmed evidence"),
        ("What do you think about consciousness?", "inference", "INFERRED", True, "Reasonable speculation"),
        ("What is 2+2?", "fact", "KNOWN", True, "Equals 4"),
    ]
    
    for query, resp_type, confidence, accuracy, notes in test_claims:
        tracker.record_claim(query, resp_type, confidence, accuracy, notes)
    
    # Get report
    print("=== Aletheia Calibration Report ===\n")
    report = tracker.get_calibration_report()
    
    for key, value in report.items():
        if value is not None and isinstance(value, float):
            print(f"{key}: {value:.1f}%")
        else:
            print(f"{key}: {value}")
    
    # Drift analysis
    print("\n=== Drift Analysis ===")
    drift = tracker.get_drift_analysis()
    for key, value in drift.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    demo()