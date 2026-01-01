"""Tests for running API and UI together."""

from abraxas import run_all


def test_run_all_starts_api_and_ui(monkeypatch):
    calls = {}

    def fake_api(host, port):
        calls["api"] = (host, port)

    def fake_ui(host, port):
        calls["ui"] = (host, port)

    monkeypatch.setattr(run_all, "_start_api", fake_api)
    monkeypatch.setattr(run_all, "run_ui", fake_ui)

    run_all.run_all(api_host="0.0.0.0", api_port=9000, ui_host="127.0.0.1", ui_port=3100)

    assert calls["api"] == ("0.0.0.0", 9000)
    assert calls["ui"] == ("127.0.0.1", 3100)
