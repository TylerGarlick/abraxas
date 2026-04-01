# Abraxas Test Suite

This directory contains Abraxas's comprehensive testing infrastructure.

## Structure

```
tests/
├── README.md              # This file
├── framework/             # Test framework documentation
│   └── 01-testing-framework.md
├── queries/               # Test query bank
│   └── 02-test-query-bank.md
├── results/               # Historical test results
│   ├── 03-results-tracker.md
│   └── *.json             # Historical JSON result files
├── conftest.py            # Pytest configuration
├── test_*.py              # Python test suites (canonical tests)
```

## Test Types

### Python Tests (Canonical)
The `test_*.py` files are the primary test suites, written in Python:
- `test_abraxas_v2_7dim.py` - Core 7-dimension evaluation
- `test_adversarial.py` - Adversarial robustness testing
- `test_anti_confabulation.py` - Anti-confabulation measures
- `test_integration.py` - Full system integration tests
- `test_aitia.py`, `test_chronos.py`, `test_claim_parser.py`, etc.

### Markdown Documentation
The markdown files in `framework/`, `queries/`, and `results/` contain:
- **framework/** - Testing methodology and framework design
- **queries/** - Standardized test queries for evaluation
- **results/** - Historical test results and tracker

## Running Tests

```bash
# Run all Python tests
pytest tests/

# Run specific test file
pytest tests/test_abraxas_v2_7dim.py

# Run with verbose output
pytest tests/ -v
```

## Historical Context

The markdown files in this directory were migrated from `research/` to organize test-related documentation alongside the Python test suite. This separation ensures:
1. Python tests remain the canonical, executable tests
2. Documentation and historical results are preserved and accessible
3. Clear separation between automated tests and research/evaluation materials
