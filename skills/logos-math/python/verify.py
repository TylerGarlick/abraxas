import math
import re
import json
import sys
from typing import List, Dict, Any, Optional, Union, Tuple
from dataclasses import dataclass, asdict

# Using sympify-like capabilities via basic python and potential future sympy integration
# For now, duplicating the mathjs-like logic from the JS files

ROUND_TOLERANCE = 1e-10


@dataclass
class Step:
    step: int
    description: str
    result: Any


@dataclass
class VerificationResult:
    status: str
    expression: str
    computed: Any = None
    claimed: Any = None
    comparison: Optional[str] = None
    confidence: int = 0
    message: Optional[str] = None
    steps: List[Step] = None
    error: Optional[str] = None
    diff: Optional[float] = None


def solve_linear_equation(left_side: str, right_side: str) -> Optional[Dict[str, Any]]:
    """
    Symbolic equation solver for linear equations: ax + b = c
    """

    def combine_like_terms(expr: str):
        coeff_x = 0.0
        constant = 0.0

        # Normalize: remove spaces, handle implicit multiplication (e.g., 2x -> 2*x)
        normalized = re.sub(r"(\d)([a-z])", r"\1*\2", expr).replace(" ", "")

        # Tokenize on + and -
        tokens = re.findall(r"[+-]?[^-+]+", normalized)

        for token in tokens:
            token = token.strip()
            if not token:
                continue

            if "x" in token:
                # Extract coefficient
                coeff = token.replace("x", "").replace("*", "").replace("+", "")
                if coeff == "-":
                    coeff = "-1"
                elif coeff == "" or coeff == "+":
                    coeff = "1"

                try:
                    coeff_x += float(coeff)
                except ValueError:
                    pass
            else:
                try:
                    constant += float(token)
                except ValueError:
                    pass

        return coeff_x, constant

    try:
        coeff_x, const_left = combine_like_terms(left_side)
        right_val = float(re.sub(r"\s+", "", right_side))

        if coeff_x == 0:
            return None

        solution = (right_val - const_left) / coeff_x

        return {
            "solution": solution,
            "steps": [
                Step(
                    1,
                    f"Parse equation: {left_side} = {right_side}",
                    f"Coefficient of x: {coeff_x}, constant: {const_left}",
                ),
                Step(
                    2,
                    f"Isolate x: x = ({right_val} - {const_left}) / {coeff_x}",
                    f"x = {right_val - const_left} / {coeff_x}",
                ),
                Step(3, "Compute solution", f"x = {solution}"),
            ],
        }
    except Exception as e:
        return None


def calculate_binomial_probability(n: int, k: int, p: float = 0.5) -> Dict[str, Any]:
    """
    P(X = k) = C(n,k) * p^k * (1-p)^(n-k)
    """
    import math

    n_ck = math.comb(n, k)
    pk = math.pow(p, k)
    qnk = math.pow(1 - p, n - k)

    probability = n_ck * pk * qnk

    denominator = math.pow(2, n)
    numerator = round(probability * denominator)

    return {
        "probability": probability,
        "fraction": f"{numerator}/{int(denominator)}",
        "n_ck": n_ck,
        "steps": [
            Step(1, "Binomial formula: P(X=k) = C(n,k) * p^k * (1-p)^(n-k)", ""),
            Step(2, f"C({n},{k}) = {n}! / ({k}! * {n - k}!)", f"= {n_ck}"),
            Step(3, f"p^k = ({p})^${k}", f"= {pk}"),
            Step(4, f"(1-p)^(n-k) = {1 - p}^${n - k}", f"= {qnk}"),
            Step(
                5,
                f"P(X={k}) = {n_ck} * {pk} * {qnk}",
                f"= {probability} = {numerator}/{int(denominator)}",
            ),
        ],
    }


def calculate_eigenvalues_2x2(matrix: List[List[float]]) -> Dict[str, Any]:
    """
    λ² - (a+d)λ + (ad-bc) = 0
    """
    if len(matrix) != 2 or len(matrix[0]) != 2 or len(matrix[1]) != 2:
        return {"error": "Only 2x2 matrices supported"}

    a, b = matrix[0][0], matrix[0][1]
    c, d = matrix[1][0], matrix[1][1]

    trace = a + d
    det = a * d - b * c
    discriminant = trace**2 - 4 * det

    if discriminant < 0:
        real = trace / 2
        imag = math.sqrt(-discriminant) / 2
        return {
            "eigenvalues": [{"re": real, "im": imag}, {"re": real, "im": -imag}],
            "type": "complex",
            "steps": [
                Step(1, f"Matrix A = [[{a},{b}],[{c},{d}]]", ""),
                Step(
                    2,
                    "Characteristic polynomial: det(A - λI) = 0",
                    f"λ² - {trace}λ + {det} = 0",
                ),
                Step(
                    3,
                    f"Discriminant: Δ = {trace}² - 4({det}) = {discriminant}",
                    "Δ < 0, complex eigenvalues",
                ),
                Step(
                    4,
                    f"λ = ({trace} ± √{discriminant}) / 2",
                    f"λ₁ = {real} + {imag}i, λ₂ = {real} - {imag}i",
                ),
            ],
        }

    sqrt_disc = math.sqrt(discriminant)
    lambda1 = (trace + sqrt_disc) / 2
    lambda2 = (trace - sqrt_disc) / 2

    return {
        "eigenvalues": sorted([lambda1, lambda2], reverse=True),
        "type": "real",
        "trace": trace,
        "det": det,
        "steps": [
            Step(1, f"Matrix A = [[{a},{b}],[{c},{d}]]", ""),
            Step(
                2,
                "Characteristic polynomial: det(A - λI) = 0",
                f"λ² - {trace}λ + {det} = 0",
            ),
            Step(
                3,
                f"Discriminant: Δ = {trace}² - 4({det}) = {discriminant}",
                f"√Δ = {sqrt_disc}",
            ),
            Step(
                4, f"λ = ({trace} ± {sqrt_disc}) / 2", f"λ₁ = {lambda1}, λ₂ = {lambda2}"
            ),
        ],
    }


def evaluate_expression(expr: str) -> Dict[str, Any]:
    """
    Core evaluation logic, replacing mathjs.evaluate
    """
    expr = expr.strip()

    # Integral shorthand: "integral of x^2 from 0 to 1"
    integral_match = re.search(
        r"integral\s+of\s+(.+?)\s+from\s+([\d.]+)\s+to\s+([\d.]+)", expr, re.I
    )
    if integral_match:
        integrand = integral_match.group(1).strip()
        lower = float(integral_match.group(2))
        upper = float(integral_match.group(3))

        power_match = re.search(r"x\^?(\d+)?", integrand)
        if power_match:
            power = int(power_match.group(1)) if power_match.group(1) else 1
            result = (math.pow(upper, power + 1) - math.pow(lower, power + 1)) / (
                power + 1
            )
            return {
                "success": True,
                "value": result,
                "type": "number",
                "derivation": f"∫x^{power}dx from {lower} to {upper} = [x^{power + 1}/{power + 1}]{lower}^{upper} = {result}",
            }

    # Binomial probability: P(k heads in n flips)
    if re.search(r"P\(.*?heads.*?\)", expr, re.I):
        n_match = re.search(r"(\d+)\s*flips?", expr, re.I)
        k_match = re.search(r"(\d+)\s*heads?", expr, re.I)
        if n_match and k_match:
            n = int(n_match.group(1))
            k = int(k_match.group(1))
            res = calculate_binomial_probability(n, k)
            return {
                "success": True,
                "value": res["probability"],
                "type": "number",
                "fraction": res["fraction"],
                "steps": res["steps"],
                "derivation": f"Binomial: C({n},{k}) * (0.5)^{k} * (0.5)^{n - k} = {res['fraction']}",
            }

    # Eigenvalues: eigenvalues of [[a,b],[c,d]]
    eig_match = re.search(r"eigenvalues?\s+of\s+(\[\[.*?\]\])", expr, re.I)
    if eig_match:
        try:
            matrix = json.loads(eig_match.group(1))
            res = calculate_eigenvalues_2x2(matrix)
            if "error" in res:
                return {"success": False, "error": res["error"]}
            return {
                "success": True,
                "value": res["eigenvalues"],
                "type": "array",
                "steps": res["steps"],
                "derivation": f"Characteristic polynomial: λ² - {res['trace']}λ + {res['det']} = 0",
            }
        except Exception as e:
            return {"success": False, "error": f"Failed to parse matrix: {str(e)}"}

    # General arithmetic evaluation using a safe subset of eval (via a simplified parser or restricted eval)
    # Since the original used mathjs, for this MVP rewrite, we'll use a safe evaluation of basic math
    try:
        # Basic cleanup to allow eval of standard math ops
        safe_expr = expr.replace("^", "**")
        # Caution: in a real production system, use a proper parser like `asteval` or `sympy`
        # For the purpose of this migration, we use float-based eval for simple arithmetic
        result = eval(safe_expr, {"__builtins__": {}}, {"math": math})
        return {"success": True, "value": result, "type": type(result).__name__}
    except Exception as e:
        return {"success": False, "error": str(e)}


def compare_values(
    computed: Any, claimed: Any, tolerance: float = ROUND_TOLERANCE
) -> Dict[str, Any]:
    """
    Compares two mathematical results
    """
    # Complex numbers (simulated as dicts or complex type)
    if isinstance(computed, complex) or (
        isinstance(computed, dict) and "re" in computed
    ):
        c_re = computed.re if isinstance(computed, dict) else computed.real
        c_im = computed.im if isinstance(computed, dict) else computed.imag

        if isinstance(claimed, complex) or (
            isinstance(claimed, dict) and "re" in claimed
        ):
            cl_re = claimed.re if isinstance(claimed, dict) else claimed.real
            cl_im = claimed.im if isinstance(claimed, dict) else claimed.imag
            diff = abs(c_re - cl_re) + abs(c_im - cl_im)
            return {"match": diff < tolerance, "type": "complex", "diff": diff}
        return {"match": False, "type": "complex_mismatch"}

    # Arrays/Lists
    if isinstance(computed, list) or isinstance(claimed, list):
        if not (isinstance(computed, list) and isinstance(claimed, list)):
            return {"match": False, "type": "array_mismatch"}
        if len(computed) != len(claimed):
            return {
                "match": False,
                "type": "length_mismatch",
                "expected": len(computed),
                "actual": len(claimed),
            }

        all_match = all(
            compare_values(c, cl, tolerance)["match"]
            for c, cl in zip(computed, claimed)
        )
        return {"match": all_match, "type": "array", "length": len(computed)}

    # Numbers
    if isinstance(computed, (int, float)) and isinstance(claimed, (int, float)):
        if math.isnan(computed) and math.isnan(claimed):
            return {"match": True, "type": "both_nan"}
        if math.isnan(computed) or math.isnan(claimed):
            return {"match": False, "type": "nan_mismatch"}

        diff = abs(computed - claimed)
        match = diff < tolerance or (
            math.isfinite(diff)
            and diff / max(abs(computed), abs(claimed), 1e-10) < tolerance
        )
        return {"match": match, "type": "number", "diff": diff}

    # Strings/Symbolic
    if isinstance(computed, str) and isinstance(claimed, str):
        norm = lambda s: s.lower().replace(" ", "").replace("(", "").replace(")", "")
        return {"match": norm(computed) == norm(claimed), "type": "string"}

    # Primitives/Objects
    return {"match": computed == claimed, "type": "primitive"}


def verify(expression: str, claimed_result: Any = None) -> VerificationResult:
    """
    Cores verification pipeline for logos-math
    """
    # Equation check
    eq_match = re.match(r"^(.+?)\s*=\s*(.+)$", expression)

    if eq_match:
        left_side = eq_match.group(1).strip()
        right_side = eq_match.group(2).strip()

        # Check for integrals
        if not re.search(r"integral\s+of\s+.*\s+from\s+.*\s+to\s+.*", expression, re.I):
            # Check for free variables
            known_math = {
                "pi",
                "sin",
                "cos",
                "tan",
                "log",
                "exp",
                "sqrt",
                "abs",
                "int",
                "diff",
                "dx",
                "dt",
                "dy",
                "heads",
                "tails",
                "flips",
                "trials",
                "p",
            }
            all_tokens = re.findall(r"[a-z]+", (left_side + " " + right_side).lower())
            has_variables = any(len(t) == 1 and t not in known_math for t in all_tokens)

            if has_variables:
                solution = solve_linear_equation(left_side, right_side)
                if solution:
                    computed_x = solution["solution"]

                    # Evaluate right side to get claimed value
                    claimed_eval = evaluate_expression(right_side)
                    claimed_val = (
                        claimed_eval["value"]
                        if claimed_eval["success"]
                        else float(right_side)
                    )

                    # Solve for verification: substitute x back to left side
                    test_left = left_side.replace("x", str(computed_x))
                    computed_left = evaluate_expression(test_left)

                    if (
                        computed_left["success"]
                        and abs(computed_left["value"] - claimed_val) < ROUND_TOLERANCE
                    ):
                        return VerificationResult(
                            status="VERIFIED",
                            expression=expression,
                            computed=computed_x,
                            claimed=claimed_val,
                            comparison="number",
                            confidence=5,
                            message=f"Linear equation solved: x = {computed_x}",
                            steps=[
                                Step(s.step, s.description, s.result)
                                for s in solution["steps"]
                            ],
                        )

                return VerificationResult(
                    status="ERROR",
                    expression=expression,
                    error="Equations with variables require symbolic solving (not yet implemented)",
                    confidence=0,
                )

        # No variables or is integral - evaluate both sides
        left_res = evaluate_expression(left_side)
        if not left_res["success"]:
            return VerificationResult(
                status="ERROR",
                expression=expression,
                error=f"Left side error: {left_res['error']}",
                confidence=0,
            )

        right_res = evaluate_expression(right_side)
        if not right_res["success"]:
            return VerificationResult(
                status="ERROR",
                expression=expression,
                error=f"Right side error: {right_res['error']}",
                confidence=0,
            )

        comparison = compare_values(left_res["value"], right_res["value"])

        if comparison["match"]:
            return VerificationResult(
                status="VERIFIED",
                expression=expression,
                computed=left_res["value"],
                claimed=right_res["value"],
                comparison=comparison["type"],
                confidence=5,
                message="Equation is valid",
                steps=[
                    Step(1, f"Evaluate left side: {left_side}", left_res["value"]),
                    Step(2, f"Evaluate right side: {right_side}", right_res["value"]),
                    Step(
                        3,
                        "Compare results",
                        "MATCH" if comparison["match"] else "MISMATCH",
                    ),
                ],
            )
        else:
            return VerificationResult(
                status="CONFLICT",
                expression=expression,
                computed=left_res["value"],
                claimed=right_res["value"],
                comparison=comparison["type"],
                diff=comparison.get("diff"),
                confidence=1,
                message=f"Equation is invalid: {left_res['value']} ≠ {right_res['value']}",
                steps=[
                    Step(1, f"Evaluate left side: {left_side}", left_res["value"]),
                    Step(2, f"Evaluate right side: {right_side}", right_res["value"]),
                    Step(3, "Compare results", "MISMATCH"),
                ],
            )

    # Single expression
    eval_res = evaluate_expression(expression)
    if not eval_res["success"]:
        return VerificationResult(
            status="ERROR", expression=expression, error=eval_res["error"], confidence=0
        )

    computed = eval_res["value"]
    if claimed_result is None:
        return VerificationResult(
            status="VERIFIED",
            expression=expression,
            computed=computed,
            confidence=5,
            message="Expression evaluated successfully",
            steps=[
                Step(s.step, s.description, s.result) for s in eval_res.get("steps", [])
            ],
        )

    comparison = compare_values(computed, claimed_result)
    if comparison["match"]:
        return VerificationResult(
            status="VERIFIED",
            expression=expression,
            computed=computed,
            claimed=claimed_result,
            comparison=comparison["type"],
            confidence=5,
            message="Claim matches computation",
        )
    else:
        return VerificationResult(
            status="CONFLICT",
            expression=expression,
            computed=computed,
            claimed=claimed_result,
            comparison=comparison["type"],
            diff=comparison.get("diff"),
            confidence=1,
            message=f"Claim ({claimed_result}) does not match computation ({computed})",
        )


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python verify.py "expression" [--claim "result"]')
        sys.exit(1)

    expr = sys.argv[1]
    claimed = None

    if "--claim" in sys.argv:
        idx = sys.argv.index("--claim")
        if idx + 1 < len(sys.argv):
            val = sys.argv[idx + 1]
            ev = evaluate_expression(val)
            claimed = ev["value"] if ev["success"] else val

    res = verify(expr, claimed)
    # Convert dataclasses to dict for JSON
    output = asdict(res)
    # Handle list of Step objects
    if output.get("steps"):
        output["steps"] = [asdict(s) for s in res.steps]

    print(json.dumps(output, indent=2))
    sys.exit(1 if res.status == "ERROR" else 0)
