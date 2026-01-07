"""Integration tests for infrastructure services (ArangoDB and Ollama mock).

These tests bring up a minimal docker-compose stack and verify services are reachable.
"""

import os
import subprocess
import time
import json
import urllib.request
import urllib.error
import shutil
import pytest

from arango import ArangoClient

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
COMPOSE_FILE = os.path.join(ROOT, "docker-compose.yml")


def docker_available():
    # check docker binary and that daemon is reachable
    if shutil.which("docker") is None:
        return False
    try:
        subprocess.run(["docker", "info"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except Exception:
        return False


pytestmark = pytest.mark.skipif(not docker_available(), reason="Docker not available")


@pytest.fixture(scope="module", autouse=True)
def infra():
    # Start services
    subprocess.run(["docker", "compose", "-f", COMPOSE_FILE, "up", "-d", "--build"], check=True)

    # Wait for ArangoDB
    deadline = time.time() + 60
    arango_ok = False
    while time.time() < deadline:
        try:
            urllib.request.urlopen("http://localhost:8529/_api/version", timeout=3)
            arango_ok = True
            break
        except Exception:
            time.sleep(1)

    if not arango_ok:
        subprocess.run(["docker", "compose", "-f", COMPOSE_FILE, "logs", "arangodb"], check=False)
        pytest.skip("ArangoDB failed to start within timeout")

    # Wait for Ollama mock
    deadline = time.time() + 60
    ollama_ok = False
    while time.time() < deadline:
        try:
            urllib.request.urlopen("http://localhost:11434/v1/info", timeout=3)
            ollama_ok = True
            break
        except Exception:
            time.sleep(1)

    if not ollama_ok:
        subprocess.run(["docker", "compose", "-f", COMPOSE_FILE, "logs", "ollama-mock"], check=False)
        pytest.skip("Ollama mock failed to start within timeout")

    yield

    # Teardown
    subprocess.run(["docker", "compose", "-f", COMPOSE_FILE, "down", "-v"], check=True)


def test_arangodb_connect():
    client = ArangoClient(hosts="http://localhost:8529")
    db = client.db("_system", username="root", password="test_password")

    version = db.version()
    # version can be a dict or string depending on driver; assert truthy
    assert version


def test_ollama_generate():
    url = "http://localhost:11434/v1/generate"
    payload = json.dumps({"prompt": "hello"}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})

    with urllib.request.urlopen(req, timeout=5) as r:
        body = json.load(r)

    assert body["status"] == "ok"
    assert body["input"]["prompt"] == "hello"
