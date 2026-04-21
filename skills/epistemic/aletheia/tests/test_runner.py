#!/usr/bin/env python3
"""
Aletheia Test Runner

Run all tests with coverage reporting.

Usage:
    python test_runner.py           # Run all tests
    python test_runner.py -v        # Verbose output
    python test_runner.py --cov     # With coverage
"""

import sys
import os
from pathlib import Path

# Add python directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'python'))

def run_tests(verbose=False, coverage=False):
    """Run all tests"""
    import pytest
    
    # Build pytest arguments
    args = [
        str(Path(__file__).parent),  # Test directory
        '--tb=short',
    ]
    
    if verbose:
        args.append('-v')
    
    if coverage:
        args.extend([
            '--cov=../python',
            '--cov-report=term-missing',
            '--cov-report=html:coverage_html',
        ])
    
    # Run tests
    exit_code = pytest.main(args)
    
    return exit_code


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Run Aletheia tests')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    parser.add_argument('--cov', action='store_true', help='With coverage')
    
    args = parser.parse_args()
    
    exit_code = run_tests(verbose=args.verbose, coverage=args.cov)
    sys.exit(exit_code)
