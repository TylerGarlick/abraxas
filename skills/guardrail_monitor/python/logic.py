import datetime
import re
from typing import List, Dict, Any, Optional

class PathosValueTracker:
    """Value & Saliency Tracking"""
    def __init__(self):
        self.values = {}
        self.salience_history = []

    def detect_salience(self, input_text: str) -> float:
        normalized = input_text.lower()
        score = 0.5
        
        high_markers = ["must", "critical", "essential", "urgent", "important", "need", "require", "!"]
        for marker in high_markers:
            if marker in normalized:
                score += 0.15
                
        intensifiers = ["very", "extremely", "absolutely", "really", "highly"]
        for int_marker in intensifiers:
            if int_marker in normalized:
                score += 0.1
                
        words = normalized.split()
        word_counts = {}
        for w in words:
            word_counts[w] = word_counts.get(w, 0) + 1
        for w, count in word_counts.items():
            if count >= 3 and len(w) > 3:
                score += 0.1
                
        return min(1.0, score)

    def extract_values(self, input_text: str) -> List[Dict[str, Any]]:
        extracted = []
        normalized = input_text.lower()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        categories = {
            "safety": ["safe", "risk", "danger"],
            "accuracy": ["accurate", "correct", "verify", "fact"],
            "privacy": ["private", "confidential", "secret"],
            "ethics": ["ethical", "fair", "just"],
            "autonomy": ["choose", "decide", "control"],
            "efficiency": ["fast", "efficient", "quick", "speed"],
        }
        
        for cat, markers in categories.items():
            if any(m in normalized for m in markers):
                extracted.append({
                    "id": f"val_{int(datetime.datetime.now().timestamp())}_{cat}",
                    "category": cat,
                    "statement": f"User prioritizes {cat}",
                    "salienceScore": self.detect_salience(input_text),
                    "explicit": any(m in normalized for m in ["must be", "first", "strictly"]),
                    "timestamp": now,
                    "context": input_text,
                })
        return extracted

    def check_value_saliency(self, topic: str, decision_context: Optional[str] = None, user_values: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        normalized_topic = topic.lower()
        all_values = list(self.values.values()) + (user_values or [])
        
        relevant_values = [
            v for v in all_values 
            if normalized_topic in v["category"] or normalized_topic in v["statement"].lower() or v["salienceScore"] >= 0.7
        ]
        
        if not relevant_values and decision_context:
            extracted = self.extract_values(decision_context)
            relevant_values = [v for v in extracted if normalized_topic in v["category"] or normalized_topic in v["statement"].lower() or v["salienceScore"] >= 0.7]
            
        saliency_score = sum(v["salienceScore"] for v in relevant_values) / len(relevant_values) if relevant_values else 0.3
        
        conflicts = []
        if decision_context:
            ctx = decision_context.lower()
            context_values = self.extract_values(decision_context)
            value_categories = {v["category"] for v in context_values}
            
            if "safety" in value_categories and "efficiency" in value_categories and "fast" in ctx and "safe" in ctx:
                conflicts.append("Safety vs Efficiency tension detected")
                
            if "privacy" in value_categories and "accuracy" in value_categories and "verify" in ctx and "private" in ctx:
                conflicts.append("Privacy vs Verification tension detected")
                
        recommendations = []
        if saliency_score >= 0.8:
            recommendations.append("High value saliency — ensure output aligns with stated priorities")
        if conflicts:
            recommendations.append("Value conflicts detected — consider surfacing tradeoffs to user")
        if not relevant_values:
            recommendations.append("No strong values detected — default to balanced approach")
            
        return {
            "relevantValues": relevant_values,
            "saliencyScore": round(saliency_score, 2),
            "conflicts": conflicts,
            "recommendations": recommendations,
        }

class PhemeVerifier:
    """Ground Truth Verification"""
    def __init__(self):
        self.source_reliability = {
            "nature.com": 0.95, "science.org": 0.95, "arxiv.org": 0.90,
            "reuters.com": 0.88, "apnews.com": 0.88, "bbc.com": 0.85,
            "wikipedia.org": 0.80, "britannica.com": 0.88, "snopes.com": 0.82,
            "politifact.com": 0.80, "twitter.com": 0.30, "reddit.com": 0.35,
            "facebook.com": 0.25,
        }
        self.cache = {}

    def verify_ground_truth(self, claim: str, sources: Optional[List[str]] = None, require_min_sources: int = 2) -> Dict[str, Any]:
        sources = sources or []
        if claim in self.cache:
            return self.cache[claim]
            
        source_verdicts = []
        for s in sources:
            rel = self.source_reliability.get(s.lower(), 0.5)
            verdict = "neutral" # Simulated
            source_verdicts.append({"name": s, "reliability": rel, "verdict": verdict})
            
        supporting = [s for s in source_verdicts if s["verdict"] == "supports"]
        contradicting = [s for s in source_verdicts if s["verdict"] == "contradicts"]
        
        status = "UNVERIFIABLE"
        confidence = 0.0
        
        if len(supporting) >= require_min_sources:
            status = "VERIFIED"
            avg_rel = sum(s["reliability"] for s in supporting) / len(supporting)
            confidence = avg_rel * min(len(supporting) / require_min_sources, 1.0)
        elif contradicting:
            if any(s["reliability"] >= 0.8 for s in contradicting):
                status = "CONTRADICTED"
                confidence = sum(s["reliability"] for s in contradicting) / len(contradicting)
            else:
                status = "UNVERIFIABLE"
                confidence = 0.3
        elif not sources:
            status = "UNVERIFIABLE"
            confidence = 0.0
        else:
            status = "PENDING"
            confidence = 0.5
            
        result = {
            "claim": claim,
            "status": status,
            "confidence": round(confidence, 2),
            "sources": source_verdicts,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        self.cache[claim] = result
        return result

class KratosArbiter:
    """Authority & Conflict Arbitration"""
    def __init__(self):
        self.authority_levels = {
            "auth_peer_reviewed": {"name": "Peer-Reviewed Research", "precedence": 100},
            "auth_government": {"name": "Government/Official Data", "precedence": 90},
            "auth_established_news": {"name": "Established News", "precedence": 75},
            "auth_expert": {"name": "Expert Consensus", "precedence": 70},
            "auth_technical": {"name": "Technical Documentation", "precedence": 60},
            "auth_encyclopedia": {"name": "Encyclopedia/Reference", "precedence": 50},
            "auth_blog": {"name": "Technical Blogs", "precedence": 30},
            "auth_social": {"name": "Social Media", "precedence": 10},
        }
        self.domain_rules = {
            "medical": [{"pattern": r"fda|cdc|who", "rule": "Health authority takes precedence", "precedence": 95}],
            "legal": [{"pattern": r"court|statute|regulation", "rule": "Legal authority takes precedence", "precedence": 95}],
            "scientific": [{"pattern": r"peer.?review|journal", "rule": "Peer review is gold standard", "precedence": 100}],
        }

    def get_authority(self, source: str, domain: str) -> Dict[str, Any]:
        s = source.lower()
        if any(x in s for x in ["nature", "science", "cell"]): return self.authority_levels["auth_peer_reviewed"]
        if any(x in s for x in ["gov", "cdc", "fda"]): return self.authority_levels["auth_government"]
        if any(x in s for x in ["reuters", "ap", "bbc"]): return self.authority_levels["auth_established_news"]
        if any(x in s for x in ["wikipedia", "britannica"]): return self.authority_levels["auth_encyclopedia"]
        if any(x in s for x in ["twitter", "reddit", "facebook"]): return self.authority_levels["auth_social"]
        return self.authority_levels["auth_technical"]

    def get_domain_rule(self, source: str, domain: str) -> Optional[Dict[str, Any]]:
        rules = self.domain_rules.get(domain, [])
        for r in rules:
            if re.search(r["pattern"], source, re.I):
                return r
        return None

    def arbitrate_conflict(self, claimA: str, claimB: str, sourceA: str, sourceB: str, domain: str = "general") -> Dict[str, Any]:
        authA = self.get_authority(sourceA, domain)
        authB = self.get_authority(sourceB, domain)
        
        ruleA = self.get_domain_rule(sourceA, domain)
        ruleB = self.get_domain_rule(sourceB, domain)
        
        precA = ruleA["precedence"] if ruleA else authA["precedence"]
        precB = ruleB["precedence"] if ruleB else authB["precedence"]
        
        winner = "UNRESOLVED"
        reasoning = []
        confidence = 0.5
        precedence_used = False
        domain_specific_rule = None
        
        if precA > precB + 10:
            winner = "A"
            confidence = 0.8 + (precA - precB) / 200
            # If a domain rule was used, we use its wording, otherwise the general authority wording
            if ruleA:
                reasoning.append(ruleA["rule"])
            else:
                reasoning.append(f"{sourceA} ({authA['name']}) has higher authority than {sourceB} ({authB['name']})")
            precedence_used = True
        elif precB > precA + 10:
            winner = "B"
            confidence = 0.8 + (precB - precA) / 200
            if ruleB:
                reasoning.append(ruleB["rule"])
            else:
                reasoning.append(f"{sourceB} ({authB['name']}) has higher authority than {sourceA} ({authA['name']})")
            precedence_used = True
        else:
            if ruleA and not ruleB:
                winner = "A"
                confidence = 0.7
                reasoning.append(ruleA["rule"])
                domain_specific_rule = ruleA["rule"]
            elif ruleB and not ruleA:
                winner = "B"
                confidence = 0.7
                reasoning.append(ruleB["rule"])
                domain_specific_rule = ruleB["rule"]
            else:
                reasoning.append("Insufficient authority differential to resolve conflict")
        
        return {
            "conflictId": f"conflict_{int(datetime.datetime.now().timestamp())}",
            "winner": winner,
            "reasoning": "; ".join(reasoning),
            "confidence": round(min(0.95, confidence), 2),
            "precedenceUsed": precedence_used,
            "domainSpecificRule": domain_specific_rule,
        }

class GuardrailLogic:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GuardrailLogic, cls).__new__(cls)
            cls._instance.pathos = PathosValueTracker()
            cls._instance.pheme = PhemeVerifier()
            cls._instance.kratos = KratosArbiter()
        return cls._instance
