from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class FilterResult:
    original_count: int
    filtered_count: int
    culling_rate: float
    filtered_context: str


class KairosLogic:
    def filter_fragments(self, query: str, fragments: str) -> FilterResult:
        """
        Filter retrieved fragments for maximum epistemic relevance.
        """
        lines = [line.strip() for line in fragments.split("\n") if line.strip()]
        keywords = query.lower().split()

        if not keywords:
            return FilterResult(len(lines), len(lines), 0.0, fragments)

        filtered = []
        for line in lines:
            match_count = sum(1 for k in keywords if k in line.lower())
            if match_count / len(keywords) >= 0.3:
                filtered.append(line)

        culling_rate = (1 - len(filtered) / len(lines)) * 100 if lines else 0.0

        return FilterResult(
            original_count=len(lines),
            filtered_count=len(filtered),
            culling_rate=culling_rate,
            filtered_context="\n".join(filtered),
        )

    def assess_urgency(self, query: str) -> Dict[str, Any]:
        """
        Determine the temporal urgency of a query (Real-time vs Archival).
        """
        real_time_keywords = ["now", "today", "current", "latest", "live", "recent"]
        q_lower = query.lower()
        is_real_time = any(k in q_lower for k in real_time_keywords)

        return {
            "mode": "REAL-TIME" if is_real_time else "ARCHIVAL",
            "logic": "Temporal keywords detected."
            if is_real_time
            else "No urgency triggers found.",
        }


# Singleton instance
logic = KairosLogic()
