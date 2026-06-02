import pytest
from skills.sieve.python.logic import SieveLogic

def test_sieve_high_valence():
    sieve = SieveLogic()
    signal = "We are seeing a systemic rupture in the discourse graph."
    result = sieve.analyze_signal(signal)
    
    assert result["status"] == "HIGH_VALENCE"
    assert result["admit_to_ledger"] is True
    assert "systemic rupture" in result["matches"]

def test_sieve_noise_filtering():
    sieve = SieveLogic()
    signal = "I think it might rain today in the city."
    result = sieve.analyze_signal(signal)
    
    assert result["status"] == "NOISE"
    assert result["admit_to_ledger"] is False

def test_curate_stream():
    sieve = SieveLogic()
    signals = [
        "Loud noise 1",
        "Sovereign high-valence signal detected",
        "Loud noise 2"
    ]
    curated = sieve.curate_stream(signals)
    assert len(curated) == 1
    assert curated[0]["status"] == "HIGH_VALENCE"
