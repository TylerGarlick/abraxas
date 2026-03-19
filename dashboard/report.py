#!/usr/bin/env python3
"""
Abraxas Dashboard Report Generator

Generates markdown reports from test results, system implementations, and research papers.
Usage: python3 report.py [--output report.md] [--format markdown|json]
"""

import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

DASHBOARD_DIR = Path(__file__).parent
RESEARCH_DIR = Path(__file__).parent.parent / 'research'
SKILLS_DIR = Path(__file__).parent.parent / 'skills'
SYSTEMS_DIR = Path(__file__).parent.parent / 'systems'


def load_test_results() -> Dict[str, Any]:
    """Load aggregated test results from dashboard JSON."""
    test_data_path = DASHBOARD_DIR / 'test_data.json'
    if test_data_path.exists():
        return json.loads(test_data_path.read_text())
    return {'results': [], 'total_tests': 0}


def load_systems_data() -> Dict[str, Any]:
    """Load systems data from dashboard JSON."""
    sys_data_path = DASHBOARD_DIR / 'systems_data.json'
    if sys_data_path.exists():
        return json.loads(sys_data_path.read_text())
    return {'implemented_systems': [], 'system_implementations': []}


def scan_research_papers() -> List[Dict[str, Any]]:
    """Scan research directory for papers."""
    papers = []
    for md_file in sorted(RESEARCH_DIR.glob('*.md')):
        if 'test-results' not in md_file.name and 'results/' not in str(md_file):
            try:
                content = md_file.read_text(errors='ignore')
                # Extract title from first heading
                title = content.split('\n')[0].replace('#', '').strip()
                papers.append({
                    'name': md_file.name,
                    'path': str(md_file.relative_to(RESEARCH_DIR.parent)),
                    'title': title,
                    'size_kb': len(content) // 1024,
                    'word_count': len(content.split())
                })
            except:
                pass
    return papers


def calculate_dimension_averages(results: List[Dict]) -> Dict[str, float]:
    """Calculate average scores per dimension."""
    dimensions = ['hallucination', 'calibration', 'sycophancy', 'sol_nox', 
                  'uncertainty', 'agon', 'user_trust']
    averages = {}
    for dim in dimensions:
        scores = [r.get('dimensions', {}).get(dim, 0) for r in results]
        if scores:
            averages[dim] = sum(scores) / len(scores)
        else:
            averages[dim] = 0.0
    return averages


def identify_gaps(sys_data: Dict, test_data: Dict) -> List[str]:
    """Identify research and implementation gaps from data."""
    gaps = []
    
    # Check for low-performing dimensions
    dim_avgs = calculate_dimension_averages(test_data.get('results', []))
    for dim, score in dim_avgs.items():
        if score < 0.8:
            gaps.append(f"Improve {dim.replace('_', ' ')} (current avg: {score:.3f})")
    
    # Check for planned vs implemented systems
    implemented = len(sys_data.get('system_implementations', []))
    if implemented < 5:
        gaps.append("Expand system implementations (currently {}/5)".format(implemented))
    
    # Research gaps from 13-subagent-next-systems-report.md
    gaps.extend([
        "Causal reasoning (Aitia system) - not yet implemented",
        "Temporal coherence tracking - not yet implemented", 
        "Source provenance/citation integrity - not yet implemented",
        "Compositional verification - not yet implemented"
    ])
    
    return gaps


def generate_markdown_report(test_data: Dict, sys_data: Dict) -> str:
    """Generate comprehensive markdown report."""
    results = test_data.get('results', [])
    
    # Calculate statistics
    if results:
        avg_score = sum(r['composite_score'] for r in results) / len(results)
        min_score = min(r['composite_score'] for r in results)
        max_score = max(r['composite_score'] for r in results)
    else:
        avg_score = min_score = max_score = 0
    
    dim_avgs = calculate_dimension_averages(results)
    gaps = identify_gaps(sys_data, test_data)
    papers = scan_research_papers()
    
    report = f"""# Abraxas Dashboard Report

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}  
**Data Source:** {DASHBOARD_DIR.relative_to(Path.home())}

---

## Executive Summary

- **Total Test Runs:** {len(results)}
- **Average Composite Score:** {avg_score:.3f}
- **Score Range:** {min_score:.3f} - {max_score:.3f}
- **Implemented Systems:** {len(sys_data.get('implemented_systems', [])) + len(sys_data.get('system_implementations', []))}
- **Research Papers:** {len(papers)}

---

## Test Performance Over Time

| Timestamp | Model | Composite Score | Passed |
|-----------|-------|-----------------|--------|
"""
    
    for r in results[:15]:  # Limit to 15 most recent
        ts = r.get('timestamp', 'Unknown')[:16].replace('T', ' ')
        report += f"| {ts} | {r.get('model', 'Unknown')} | {r.get('composite_score', 0):.3f} | {'✓' if r.get('passed') else '✗'} |\n"
    
    report += f"""
---

## Dimension Performance Breakdown

| Dimension | Average Score | Status |
|-----------|---------------|--------|
"""
    
    for dim, score in sorted(dim_avgs.items(), key=lambda x: x[1], reverse=True):
        status = "✓ Strong" if score > 0.8 else "⚠ Needs Work" if score > 0.6 else "✗ Critical"
        report += f"| {dim.replace('_', ' ').title()} | {score:.3f} | {status} |\n"
    
    report += f"""
---

## System Implementation Status

### Implemented Skills
"""
    
    for skill in sys_data.get('implemented_systems', []):
        report += f"- **{skill['name']}** ({skill.get('size_kb', '?')}KB)\n"
    
    report += f"""
### System Implementations
"""
    
    for sys in sys_data.get('system_implementations', []):
        files = ', '.join(sys.get('implementation_files', []))
        report += f"- **{sys['name']}**: {files}\n"
    
    report += f"""
### Planned Systems (from Research)
- Aitia (Causal Reasoning)
- Chronos (Temporal Coherence)
- Source (Provenance Tracking)
- Koine (Compositional Verification)

---

## Research Papers Inventory

| Paper | Size | Words |
|-------|------|-------|
"""
    
    for paper in papers[:20]:  # Limit to 20
        report += f"| {paper['title'][:50]} | {paper['size_kb']}KB | {paper['word_count']} |\n"
    
    report += f"""
---

## Identified Gaps & Next Steps

"""
    
    for i, gap in enumerate(gaps, 1):
        report += f"{i}. {gap}\n"
    
    report += f"""
---

## Recommendations

### High Priority
1. **Implement Aitia** for causal reasoning capabilities
2. **Enhance Dianoia** with probability calibration
3. **Complete Ergon** tool-use verification

### Medium Priority  
4. Build temporal coherence tracking (Chronos)
5. Deploy source provenance system
6. Expand test coverage to 200+ queries

### Research Directions
7. Investigate compositional verification techniques
8. Explore multi-agent consensus patterns
9. Study uncertainty quantification methods

---

## Data Files

- `test_data.json`: Aggregated test results
- `systems_data.json`: System implementation inventory
- `index.html`: Interactive web dashboard

---

*Report generated by Abraxas Dashboard Report Generator v1.0*
"""
    
    return report


def generate_json_report(test_data: Dict, sys_data: Dict) -> Dict:
    """Generate JSON report for programmatic consumption."""
    results = test_data.get('results', [])
    
    return {
        'generated': datetime.now().isoformat(),
        'summary': {
            'total_tests': len(results),
            'avg_score': sum(r['composite_score'] for r in results) / len(results) if results else 0,
            'min_score': min(r['composite_score'] for r in results) if results else 0,
            'max_score': max(r['composite_score'] for r in results) if results else 0,
            'systems_count': len(sys_data.get('implemented_systems', [])) + len(sys_data.get('system_implementations', [])),
            'papers_count': len(scan_research_papers())
        },
        'dimensions': calculate_dimension_averages(results),
        'gaps': identify_gaps(sys_data, test_data),
        'systems': sys_data,
        'papers': scan_research_papers()
    }


def main():
    parser = argparse.ArgumentParser(description='Abraxas Dashboard Report Generator')
    parser.add_argument('--output', '-o', default='report.md', help='Output file path')
    parser.add_argument('--format', '-f', choices=['markdown', 'json'], default='markdown', 
                        help='Output format')
    args = parser.parse_args()
    
    # Load data
    test_data = load_test_results()
    sys_data = load_systems_data()
    
    # Generate report
    if args.format == 'json':
        report = generate_json_report(test_data, sys_data)
        output = json.dumps(report, indent=2)
    else:
        report = generate_markdown_report(test_data, sys_data)
        output = report
    
    # Write output
    output_path = Path(args.output)
    output_path.write_text(output)
    print(f"Report generated: {output_path.absolute()}")
    print(f"Format: {args.format}")
    print(f"Test runs: {test_data.get('total_tests', 0)}")
    print(f"Systems: {len(sys_data.get('implemented_systems', [])) + len(sys_data.get('system_implementations', []))}")


if __name__ == '__main__':
    main()
