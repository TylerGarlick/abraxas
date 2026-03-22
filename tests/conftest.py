"""
Pytest configuration and shared fixtures for Abraxas test suite.
"""
import pytest
import urllib.request
import urllib.error


OLLAMA_URL = "http://localhost:11434"


def is_ollama_available():
    """Check if Ollama is running and accessible."""
    try:
        req = urllib.request.Request(f"{OLLAMA_URL}/api/tags")
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status == 200
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (requiring Ollama or external services)"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )


@pytest.fixture(scope="session")
def ollama_available():
    """Fixture that provides whether Ollama is available."""
    return is_ollama_available()


@pytest.fixture(scope="session")
def requires_ollama():
    """Skip test if Ollama is not available."""
    if not is_ollama_available():
        pytest.skip("Ollama not available at localhost:11434")
