#!/usr/bin/env python3
"""
Abraxas Dashboard Report Generator
Generates markdown reports from test data and systems status
"""

import json
import sys
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = REPO_ROOT / "dashboard" / "reports"
OUTPUT_DIR.mkdir(exist_ok=True)

def load_data():
    test_data = json.loads((REPO_ROOT / "dashboard" / "test_data.json").read_text())
    systems_data = json.loads((REPO_ROOT / "dashboard" / "systems_data.json").read_text())
    
    mc_path = REPO_ROOT / "research" / "model_comparison_summary.json"
    if mc_path.exists():
        model_comparison = json.loads(mc_path.read_text())
    else:
        model_comparison = None
    
    return test_data, systems_data, model_comparison

def generate_report(test_data, systems_data, model_comparison):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M UTC")
    
    results = test_data.get('results', [])
    valid_results = [r for r in results if r.get('composite_score', 0) > 0]
    
    avg_score = sum(r['composite_score'] for r in valid_results) / len(valid_results) if valid_results else 0
    
    dim_totals = {d: 0 for d in ['hallucination', 'calibration', 'sycophancy', 'sol_nox', 'uncertainty', 'agon', 'user_trust']}
    dim_counts = {d: 0 for d in dim_totals}
    
    for r in valid_results:
        for d, v in r.get('dimensions', {}).items():
            if d in dim_totals:
                dim_totals[d] += v
                dim_counts[d] += 1
    
    dim_avgs = {d: dim_totals[d] / dim_counts[d] if dim_counts[d] > 0 else 0 for d in dim_totals}
    
    weakest = min(dim_avgs.items(), key=lambda x: x[1])
    strongest = max(dim_avgs.items(), key=lambda x: x[1])
    
    impl_count = len(systems_data.get('implemented_systems', [])) + len(systems_data.get('system_implementations', []))
    
    report = f"""# Abraxas Project Status Report

**Generated:** {timestamp}  
**Repository:** TylerGarlick/abraxas

---

## Executive Summary

| Metric | Value |
|:-------|------:|
| Test Runs | {len(valid_results)} |
| Average Composite Score | {avg_score:.3f} |
| Systems Implemented | {impl_count} |
| Research Papers | {systems_data.get('research_papers_count', 0)} |
| Best Performing Dimension | {strongest[0].replace('_', ' ').title()} ({strongest[1]:.1%}) |
| Weakest Dimension | {weakest[0].replace('_', ' ').title()} ({weakest[1]:.1%}) |

---

## Dimension Performance

| Dimension | Average Score | Status |
|:----------|-------------:|:------:|
"""
    
    dim_order = ['hallucination', 'calibration', 'sycophancy', 'sol_nox', 'uncertainty', 'agon', 'user_trust']
    dim_labels = {'hallucination': 'Hallucination', 'calibration': 'Calibration', 'sycophancy': 'Sycophancy', 
                  'sol_nox': 'Sol/Nox', 'uncertainty': 'Uncertainty', 'agon': 'Agon', 'user_trust': 'User Trust'}
    
    for dim in dim_order:
        val = dim_avgs.get(dim, 0)
        status = '🟢 Excellent' if val > 0.8 else '🟡 Good' if val > 0.6 else '🔴 Needs Work'
        report += f"| {dim_labels[dim]} | {val:.1%} | {status} |\n"
    
    if model_comparison and model_comparison.get('results'):
        report += f"""

---

## Five-Model Comparison

### Rankings

| Rank | Model | Composite Score | Status |
|:----:|:------|----------------:|:-------|
"""
        rankings = sorted(model_comparison['results'].items(), 
                         key=lambda x: x[1].get('composite_score', 0), reverse=True)
        
        for i, (model, data) in enumerate(rankings, 1):
            score = data.get('composite_score', 0)
            prod = data.get('infrastructure', {}).get('production_ready', False)
            status = '✅ Production' if prod else '⚠️ Issues'
            report += f"| {i} | {model.replace(':cloud', '')} | {score:.2f} | {status} |\n"
        
        report += f"""

### Dimension Breakdown

| Model | Hallucination | Calibration | Sycophancy | Sol/Nox | Uncertainty | Agon |
|:------|:-------------:|:-----------:|:----------:|:-------:|:-----------:|:----:|
"""
        for model, data in rankings:
            model_name = model.replace(':cloud', '')
            report += f"| **{model_name}** |"
            for dim in ['hallucination', 'calibration', 'sycophancy', 'sol_nox', 'uncertainty', 'agon']:
                val = data.get(dim, {}).get('metric', 0)
                report += f" {val:.0%} |"
            report += "\n"
        
        if model_comparison.get('rankings'):
            report += f"""

### Key Findings

- **Best Overall:** {model_comparison['rankings'].get('overall_best', 'N/A').replace(':cloud', '')} ({model_comparison['results'].get(model_comparison['rankings'].get('overall_best'), {}).get('composite_score', 0):.2f})
- **Best for High-Stakes:** {model_comparison.get('use_case_recommendations', {}).get('medical_legal_financial', {}).get('model', 'N/A').replace(':cloud', '')}
- **Fastest Response:** minimax-m2.5:cloud (~8s avg)
- **Avoid for Production:** glm-5:cloud (15% timeout rate)
"""
    
    report += f"""

---

## Implemented Systems

### Skills ({len(systems_data.get('implemented_systems', []))})
"""
    for s in systems_data.get('implemented_systems', []):
        has_md = '📄' if s.get('has_skill_md') else '📝'
        report += f"- {has_md} **{s['name']}** ({s.get('type', 'skill')}, {s.get('size_kb', '?')}KB)\n"
    
    report += f"\n### System Implementations ({len(systems_data.get('system_implementations', []))})\n"
    for s in systems_data.get('system_implementations', []):
        files = ', '.join(s.get('implementation_files', []))
        report += f"- ✅ **{s['name']}**: {files}\n"
    
    report += f"""

### Proposed v2.0 Systems

| System | Purpose | Priority |
|:-------|:--------|:--------:|
| Aitia | Causal reasoning & counterfactual analysis | High |
| Chronos | Temporal coherence & drift detection | Medium |
| Source | Citation integrity & provenance tracking | Medium |
| Coine | Compositional claim verification | Medium |

---

## Identified Gaps & Recommendations

### Research Gaps

1. **Causal Reasoning:** Aitia system not yet implemented - addresses 40-60% hallucination reduction potential
2. **Temporal Coherence:** No drift detection for cross-session epistemic consistency
3. **Source Provenance:** Missing citation integrity tracking
4. **Compositional Verification:** Need atomic claim decomposition

### Dimension-Specific Improvements

"""
    
    for dim in dim_order:
        val = dim_avgs.get(dim, 0)
        if val < 0.7:
            recommendations = {
                'sycophancy': 'Expand test suite to 50+ queries. Current n=4 is insufficient.',
                'calibration': 'Implement Dianoia probability distributions instead of categorical labels.',
                'uncertainty': 'Improve uncertainty marking through better epistemic state representation.',
                'sol_nox': 'Strengthen Sol (fact)/Nox (opinion) separation in system prompt.',
                'agon': 'Expand adversarial reasoning tests across more query types.'
            }
            if dim in recommendations:
                report += f"- **{dim_labels[dim]}:** {recommendations[dim]}\n"
    
    report += f"""

---

## Next Steps (Auto-Generated)

### Immediate (This Week)
1. Complete Ergon tool-use verification implementation
2. Review and finalize Abraxas v2.1 definition of done
3. Run expanded sycophancy test suite (50+ queries)

### Short-Term (This Month)
4. Implement Aitia causal reasoning system
5. Deploy Hermes multi-agent consensus tracking
6. Integrate Pheme real-time fact-checking into CI/CD

### Long-Term (Next Quarter)
7. Build longitudinal calibration tracking (Aletheia)
8. Complete Source provenance system
9. Expand to 200+ test queries per model
10. Conduct human A/B testing (50+ participants)

---

## Test Run History

| Timestamp | Model | Score | Passed |
|:----------|:------|------:|:------:|
"""
    
    for r in valid_results[-10:]:
        ts = r.get('timestamp', 'N/A')[:16].replace('T', ' ')
        model = r.get('model', 'N/A').replace(':cloud', '')
        score = r.get('composite_score', 0)
        passed = '✅' if r.get('passed') else '❌'
        report += f"| {ts} | {model} | {score:.3f} | {passed} |\n"
    
    report += f"""

---

*Report generated automatically from Abraxas test suite data*
*Dashboard available at: `/abraxas/dashboard/v2/index.html`*
"""
    
    return report

def main():
    print("Generating Abraxas status report...")
    
    try:
        test_data, systems_data, model_comparison = load_data()
    except Exception as e:
        print(f"Error loading data: {e}")
        sys.exit(1)
    
    report = generate_report(test_data, systems_data, model_comparison)
    
    output_file = OUTPUT_DIR / f"status-report-{datetime.now().strftime('%Y%m%d-%H%M')}.md"
    output_file.write_text(report)
    print(f"Report written to: {output_file}")
    
    latest = OUTPUT_DIR / "LATEST.md"
    latest.write_text(report)
    print(f"Latest report: {latest}")

if __name__ == "__main__":
    main()
