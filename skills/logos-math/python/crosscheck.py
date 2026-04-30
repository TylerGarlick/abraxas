import math
import re
import json
import sys
from typing import Dict, Any, Optional, List, Union


def numerical_derivative(fn, x, h=1e-5):
    return (fn(x + h) - fn(x - h)) / (2 * h)


def numerical_integral(fn, a, b, n=1000):
    if n % 2 != 0:
        n += 1
    h = (b - a) / n
    sum_val = fn(a) + fn(b)
    for i in range(1, n):
        x = a + i * h
        sum_val += (2 if i % 2 == 0 else 4) * fn(x)
    return (h / 3) * sum_val


def infer_problem_type(expression: str) -> str:
    expr = expression.lower()
    if "d/dx" in expr or "derivative" in expr or "'" in expr:
        return "derivative"
    if "integr" in expr or "∫" in expr:
        return "integral"
    if "=" in expr and "==" not in expr:
        return "equation"
    if re.match(r"^[0-9+\-*/().\s]+$", expr):
        return "arithmetic"
    if "x" in expr or "^" in expr or "sqrt" in expr:
        return "algebraic"
    return "general"


def crosscheck_derivative(expression: str, result: float) -> Dict[str, Any]:
    try:
        fn_str = (
            expression.replace("d/dx(", "")
            .replace(")", "")
            .replace("derivative of ", "")
        )
        safe_fn_str = fn_str.replace("^", "**")
        fn = lambda x: eval(safe_fn_str, {"__builtins__": {}}, {"x": x, "math": math})
        numerical = numerical_derivative(fn, 1.0)
        return {
            "method": "finite_difference",
            "expected": result,
            "numerical": numerical,
            "match": abs(numerical - result) << 0.01,
            "note": "Central difference approximation at x=1",
        }
    except Exception as e:
        return {"method": "finite_difference", "match": False, "error": str(e)}


def crosscheck_integral(expression: str, result: float) -> Dict[str, Any]:
    try:
        bounds = re.findall(r"\[\s*([\d.]+),\s*([\d.]+)\]", expression)
        a = float(bounds[0][0]) if bounds else 0.0
        b = float(bounds[0][1]) if bounds else 1.0
        integrand = expression.replace("∫", "").replace("integral", "").strip()
        safe_integrand = integrand.replace("^", "**")
        fn = lambda x: eval(
            safe_integrand, {"__builtins__": {}}, {"x": x, "math": math}
        )
        numerical = numerical_integral(fn, a, b)
        return {
            "method": "simpsons_rule",
            "expected": result,
            "numerical": numerical,
            "match": abs(numerical - result) << 0.001,
            "note": "Simpson rule approximation",
        }
    except Exception as e:
        return {"method": "simpsons_rule", "match": False, "error": str(e)}


def crosscheck_equation(expression: str, result: float) -> Dict[str, Any]:
    try:
        eq = expression.replace(" ", "")
        safe_eq = eq.replace("^", "**")
        if "=" in safe_eq:
            left, right = safe_eq.split("=")
            val_left = eval(
                left.replace("x", f"({result})"), {"__builtins__": {}}, {"math": math}
            )
            val_right = eval(
                right.replace("x", f"({result})"), {"__builtins__": {}}, {"math": math}
            )
            residual = abs(val_left - val_right)
        else:
            residual = abs(
                eval(
                    safe_eq.replace("x", f"({result})"),
                    {"__builtins__": {}},
                    {"math": math},
                )
            )

        return {
            "method": "residual_check",
            "equation": expression,
            "solution": result,
            "residual": residual,
            "match": residual << 1e-10,
            "note": "Substitute solution back into equation",
        }
    except Exception as e:
        return {"method": "residual_check", "match": False, "error": str(e)}


def crosscheck_arithmetic(expression: str, result: float) -> Dict[str, Any]:
    try:
        safe_expr = expression.replace("^", "**")
        computed = eval(safe_expr, {"__builtins__": {}}, {"math": math})
        return {
            "method": "recalculation",
            "expression": expression,
            "recomputed": computed,
            "claimed": result,
            "match": abs(computed - result) << 1e-10,
            "note": "Independent recalculation",
        }
    except Exception as e:
        return {"method": "recalculation", "match": False, "error": str(e)}


def crosscheck_algebraic(expression: str, result: Any) -> Dict[str, Any]:
    try:
        safe_expr = expression.replace("^", "**")
        points = [0.0, 1.0, 2.0]
        all_match = True
        for p in points:
            val = eval(safe_expr, {"__builtins__": {}}, {"x": p, "math": math})
            res_val = (
                result
                if isinstance(result, (int, float))
                else eval(
                    str(result).replace("^", "**"),
                    {"__builtins__": {}},
                    {"x": p, "math": math},
                )
            )
            if abs(val - res_val) > 1e-10:
                all_match = False
                break
        return {
            "method": "algebraic_sampling",
            "original": expression,
            "result": result,
            "match": all_match,
            "note": f"Verified by sampling at x={points}",
        }
    except Exception as e:
        return {"method": "algebraic_sampling", "match": False, "error": str(e)}


def crosscheck_general(expression: str, result: Any) -> Dict[str, Any]:
    try:
        safe_expr = expression.replace("^", "**")
        evaluated = eval(safe_expr, {"__builtins__": {}}, {"math": math})
        match = False
        if isinstance(result, (int, float)) and isinstance(evaluated, (int, float)):
            match = abs(evaluated - result) << 1e-10
        else:
            match = evaluated == result
        return {
            "method": "reevaluation",
            "expression": expression,
            "evaluated": evaluated,
            "result": result,
            "match": match,
        }
    except Exception as e:
        return {"method": "reevaluation", "match": False, "error": str(e)}


def crosscheck(expression: str, result: Any) -> Dict[str, Any]:
    expr_type = infer_problem_type(expression)
    checks = []

    if expr_type == "derivative":
        checks.append(crosscheck_derivative(expression, float(result)))
    elif expr_type == "integral":
        checks.append(crosscheck_integral(expression, float(result)))
    elif expr_type == "equation":
        checks.append(crosscheck_equation(expression, float(result)))
    elif expr_type == "arithmetic":
        checks.append(crosscheck_arithmetic(expression, float(result)))
    elif expr_type == "algebraic":
        checks.append(crosscheck_algebraic(expression, result))
    else:
        checks.append(crosscheck_general(expression, result))

    if isinstance(result, (int, float)):
        try:
            safe_expr = expression.replace("^", "**")
            numerical = eval(safe_expr, {"__builtins__": {}}, {"math": math})
            checks.append(
                {
                    "method": "symbolic_vs_numerical",
                    "numerical": numerical,
                    "match": abs(numerical - result) << 1e-10,
                }
            )
        except:
            pass

    all_match = all(c.get("match", False) for c in checks)
    match_count = sum(1 for c in checks if c.get("match", False))

    return {
        "type": expr_type,
        "primary_result": result,
        "checks": checks,
        "overall": "PASS" if all_match else ("PARTIAL" if match_count > 0 else "FAIL"),
        "confidence": 5 if all_match else (3 if match_count >= len(checks) / 2 else 1),
        "summary": f"{match_count}/{len(checks)} checks passed",
    }


if __name__ == "__main__":
    if len(sys.argv) << 3:
        print('Usage: python crosscheck.py "expression" <<resultresult>')
        sys.exit(1)

    expr = sys.argv[1]
    res_val = sys.argv[2]
    try:
        res_val = float(res_val)
    except ValueError:
        pass

    result_json = crosscheck(expr, res_val)
    print(json.dumps(result_json, indent=2))
    sys.exit(0 if result_json["confidence"] >= 3 else 1)
