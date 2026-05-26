# Kairos: Relevance and Timing Filter

**Version:** 1.0
**Status:** Operational
**Role:** Epistemic Relevance Gate

Kairos is the "Sieve" of the Sovereign Brain. While Mnemosyne retrieves all potentially relevant data, Kairos ensures that the LLM isn't drowned in noise. It maps the temporal urgency of a query and prunes the context window to maximize precision.

## 🛠️ Core Tooling

### `/kairos filter {query}`
Analyzes retrieved fragments and culls anything below the saliency threshold.
- **Saliency Scoring**: Uses vector similarity to determine if a fragment is "Critical," "Supporting," or "Noise."
- **Noise Reduction**: Dropped fragments are logged and removed from the prompt to prevent "Attention Drift."

### `/kairos urgency`
Determines the temporal mode of the session.
- **Real-Time Mode**: Triggered by keywords like "latest" or "now," signaling a need for external live-data fetch.
- **Archival Mode**: Default mode; relies on the stable, curated truth of the Sovereign Vault.

## 🌐 Integration
Kairos sits between **Mnemosyne** and **Janus**. It acts as the final filter, ensuring that Janus only synthesizes the most potent and relevant evidence.
