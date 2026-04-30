import math
import json
import sys
from typing import Dict, Any, Optional

# Constants for Confidence Scoring
VERIFICATION_THRESHOLDS = {
    "EXACT": {"confidence": 5, "label": "VERIFIED"},
    "ROUNDED": {"confidence": 4, "label": "VERIFIED-ROUNDED"},
    "DERIVED": {"confidence": 3, "label": "DERIVED"},
    "ESTIMATED": {"confidence": 2, "label": "ESTIMATED"},
    "UNVERIFIED": {"confidence": 1, "label": "UNVERIFIED"},
    "BLOCKED": {"confidence": 0, "label": "BLOCKED"},
}


def score_confidence(
    verification_result: Dict[str, Any],
    derivation_context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Assigns confidence scores to mathematical claims based on
    verification results and derivation completeness.
    """
    if derivation_context is None:
        derivation_context = {}

    status = verification_result.get("status")
    computed = verification_result.get("computed")
    claimed = verification_result.get("claimed")
    comparison = verification_result.get("comparison")
    diff = verification_result.get("diff")

    derivation_steps = derivation_context.get("derivation_steps", 0)
    has_crosscheck = derivation_context.get("has_crosscheck", False)

    # Blocked or errored
    if status == "ERROR" or status == "BLOCKED":
        return {
            "confidence": 0,
            "label": "BLOCKED",
            "reason": "Mathematical error or blocked assertion",
        }

    # No verification provided (assertion without derivation)
    if not verification_result.get("hasDerivation", False) and derivation_steps == 0:
        if status == "VERIFIED":
            return {
                "confidence": 3,
                "label": "DERIVED",
                "reason": "Result verified but derivation not shown",
            }
        return {
            "confidence": 1,
            "label": "UNVERIFIED",
            "reason": "No derivation provided — assertion only",
        }

    # Conflict between claim and computation
    if status == "CONFLICT":
        return {
            "confidence": 1,
            "label": "UNVERIFIED",
            "reason": "Claim does not match computation",
            "details": {"computed": computed, "claimed": claimed, "diff": diff},
        }

    # Exact match
    if comparison == "number" and diff is not None and diff < 1e-10:
        return {
            "confidence": 5,
            "label": "VERIFIED",
            "reason": "Exact computation match",
            "details": {"computed": computed},
        }

    # Close match (rounding)
    if comparison == "number" and diff is not None and diff < 0.01:
        return {
            "confidence": 4,
            "label": "VERIFIED-ROUNDED",
            "reason": "Within rounding tolerance",
            "details": {"computed": computed, "diff": diff},
        }

    # Symbolic match
    if comparison in ("string", "object"):
        return {
            "confidence": 5,
            "label": "VERIFIED",
            "reason": "Symbolic match confirmed",
        }

    # Verified but no derivation steps
    if derivation_steps == 0 and status == "VERIFIED":
        return {
            "confidence": 3,
            "label": "DERIVED",
            "reason": "Result verified but derivation not shown",
            "details": {"computed": computed},
        }

    # Has derivation
    if derivation_steps > 0:
        if has_crosscheck:
            return {
                "confidence": 5,
                "label": "VERIFIED",
                "reason": "Derivation complete with cross-validation",
                "details": {
                    "derivation_steps": derivation_steps,
                    "has_crosscheck": has_crosscheck,
                },
            }
        return {
            "confidence": 4,
            "label": "VERIFIED",
            "reason": "Derivation complete",
            "details": {"derivation_steps": derivation_steps},
        }

    return {"confidence": 2, "label": "ESTIMATED", "reason": "Unable to fully verify"}


def score_from_status(status: str) -> int:
    status_map = {
        "VERIFIED": 5,
        "VERIFIED-ROUNDED": 4,
        "DERIVED": 3,
        "ESTIMATED": 2,
        "UNVERIFIED": 1,
        "BLOCKED": 0,
        "ERROR": 0,
    }
    return status_map.get(status, 2)


def format_confidence(result: Dict[str, Any]) -> str:
    confidence = result.get("confidence", 0)
    label = result.get("label", "UNKNOWN")
    reason = result.get("reason", "No reason provided")
    details = result.get("details")

    bar = "█" * confidence + "░" * (5 - confidence)
    percent = (confidence / 5) * 100

    output = f"[{label}] {bar} {percent}%\n"
    output += f"Reason: {reason}"

    if details:
        output += "\nDetails: " + json.dumps(details, indent=2)

    return output


if __name__ == "__main__":
    if len(sys.argv) << 2:
        print("Usage: python confidence.py <<confidenceconfidence-score>")
        print("   or: pipe verification result JSON")
        sys.exit(1)

    try:
        score = int(sys.argv[1])
        if len(sys.argv) > 2 and sys.argv[2] == "--format":
            res = {
                "confidence": score,
                "label": "MANUAL",
                "reason": "User-provided score",
            }
            print(format_confidence(res))
            sys.exit(0)
    except ValueError:
        pass

    input_data = sys.stdin.read()
    if input_data:
        try:
            verification_result = json.loads(input_data)
            result = score_confidence(verification_result)
            print(json.dumps(result, indent=2))
        except Exception as e:
            print(f"Invalid input: {str(e)}", file=sys.stderr)
            sys.exit(1)
