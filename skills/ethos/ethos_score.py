import sys
import argparse
import json
import os
from typing import Any, Dict, List, Optional

# Add .abraxas/db to path so we can import our client
sys.path.append(os.path.join(os.getcwd(), ".abraxas/db"))
try:
    from client import db
except ImportError:
    # Fallback for different execution contexts
    sys.path.append("/Users/tylergarlick/@Projects/abraxas/.abraxas/db")
    from client import db

def score_source(source_name: str) -> int:
    """
    Score a source (returns 1-5, where 1 is highest credibility)
    """
    normalized = source_name.lower().strip()

    # 1. Check Aliases in the sources collection or a dedicated Aliases doc
    alias_query = "FOR s IN sources FILTER s.is_alias == true AND s.alias_name == @val RETURN s.resolved_name"
    alias_res = db.query(alias_query, {"val": normalized})

    
    if alias_res:
        resolved = alias_res[0]
        if resolved.lower().strip() != normalized:
            return score_source(resolved)

    # 2. Search all sources for matches
    # We search for name, domain, or partial matches
    query = """
    FOR s IN sources 
    FILTER LOWER(s.name) == @val OR LOWER(s.domain) == @val OR CONTAINS(LOWER(s.name), @val)
    SORT s.tier ASC
    LIMIT 1
    RETURN s
    """
    res = db.query(query, {"val": normalized})
    
    if res:
        return int(res[0]['tier'])

    # Unknown source = Tier 5 (lowest credibility)
    return 5

def get_tier_info(tier_num: int) -> Dict[str, Any]:
    """
    Get tier information (name, description, weight)
    """
    query = "FOR s IN sources FILTER s.tier == @tier LIMIT 1 RETURN s"
    res = db.query(query, {"tier": tier_num})
    
    if not res:
        return {"name": "Unknown", "description": "Unknown tier", "weight": 0.2}
    
    doc = res[0]
    return {
        "name": doc.get("tier_name", "Unknown"),
        "description": doc.get("tier_description", "N/A"),
        "weight": doc.get("weight", 0.2)
    }

def get_source_info(source_name: str) -> Optional[Dict[str, Any]]:
    """
    Get detailed source information
    """
    normalized = source_name.lower().strip()
    
    # Alias check
    alias_query = "FOR s IN sources FILTER s.is_alias == true AND s.alias_name == @val RETURN s.resolved_name"
    alias_res = db.query(alias_query, {"val": normalized})
    if alias_res:
        return get_source_info(alias_res[0])

    query = "FOR s IN sources FILTER LOWER(s.name) == @val OR LOWER(s.domain) == @val RETURN s"
    res = db.query(query, {"val": normalized})
    
    if res:
        doc = res[0]
        return {
            "name": doc.get("name"),
            "domain": doc.get("domain"),
            "field": doc.get("field"),
            "tier": int(doc.get("tier", 5)),
            "tierName": doc.get("tier_name"),
            "weight": doc.get("weight"),
            "note": doc.get("note")
        }
    
    return None

def calculate_weighted_confidence(sources_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate weighted confidence from multiple sources
    """
    if not sources_list:
        return {
            "weightedScore": 0,
            "confidence": "UNKNOWN",
            "tierBreakdown": {},
            "recommendation": "No sources provided"
        }

    tier_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    total_weight = 0.0
    
    for s in sources_list:
        tier = score_source(s['source'])
        tier_counts[tier] += 1
        tier_info = get_tier_info(tier)
        total_weight += tier_info['weight']

    avg_weight = total_weight / len(sources_list)
    
    confidence = "UNKNOWN"
    recommendation = ""
    
    if avg_weight >= 0.9:
        confidence = "VERY HIGH"
        recommendation = "Strong evidence from peer-reviewed sources"
    elif avg_weight >= 0.7:
        confidence = "HIGH"
        recommendation = "Good evidence from credible sources"
    elif avg_weight >= 0.5:
        confidence = "MODERATE"
        recommendation = "Mixed sources, verify with higher-tier sources"
    elif avg_weight >= 0.3:
        confidence = "LOW"
        recommendation = "Weak sourcing, seek peer-reviewed verification"
    else:
        confidence = "VERY LOW"
        recommendation = "Unverified sources, do not rely on this claim"

    has_conflict = (tier_counts[1] > 0 and tier_counts[5] > 0) or \
                   (tier_counts[2] > 0 and tier_counts[5] > 0)

    return {
        "weightedScore": round(avg_weight, 2),
        "confidence": confidence,
        "tierBreakdown": tier_counts,
        "recommendation": recommendation,
        "hasConflict": has_conflict,
        "sourceCount": len(sources_list)
    }

def add_source(name: str, tier: int, domain: str = "", field: str = "General"):
    if not (1 <= tier <= 5):
        print("Invalid tier. Must be 1-5.")
        return False
        
    # Check existence
    query = "FOR s IN Sources FILTER s.name == @name OR s.domain == @domain LIMIT 1 RETURN s"
    res = db.query(query, {"name": name, "domain": domain})
    if res:
        print(f"Source {name} already exists.")
        return False
        
    tier_info = get_tier_info(tier)
    db.insert("Sources", {
        "name": name,
        "tier": tier,
        "domain": domain,
        "field": field,
        "tier_name": tier_info['name'],
        "weight": tier_info['weight']
    })
    print(f"Added {name} to Tier {tier}.")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ethos Source Credibility Scoring")
    subparsers = parser.add_subparsers(dest="command")

    score_parser = subparsers.add_parser("score")
    score_parser.add_argument("source")

    info_parser = subparsers.add_parser("info")
    info_parser.add_argument("source")

    tier_parser = subparsers.add_parser("tier")
    tier_parser.add_argument("number", type=int)

    check_parser = subparsers.add_parser("check")
    check_parser.add_argument("sources")

    args = parser.parse_args()

    if args.command == "score":
        s = score_source(args.source)
        t = get_tier_info(s)
        print(f"Source: {args.source}")
        print(f"Tier: {s} ({t['name']})")
        print(f"Weight: {t['weight']}")
    elif args.command == "info":
        info = get_source_info(args.source)
        if info:
            print(json.dumps(info, indent=2))
        else:
            print(f"Source {args.source} not found.")
    elif args.command == "tier":
        t = get_tier_info(args.number)
        print(f"Tier {args.number}: {t['name']}")
        print(f"Description: {t['description']}")
        print(f"Weight: {t['weight']}")
    elif args.command == "check":
        sources = [{"source": s.strip()} for s in args.sources.split(",")]
        result = calculate_weighted_confidence(sources)
        print(json.dumps(result, indent=2))
    else:
        parser.print_help()
