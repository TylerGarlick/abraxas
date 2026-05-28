# Command Mapping Reference

This file serves as the source of truth for the `abraxas-alias` routing logic.

## Direct Mappings

| Alias                | System        | Command        | Description                              |
|:---------------------|:--------------|:---------------|:-----------------------------------------|
| `/abraxas:honest`    | Honest        | `/honest`      | Truth-discipline and confidence labeling |
| `/abraxas:verify`    | Honest        | `/check`       | Fact-checking and verification           |
| `/abraxas:debate`    | Agon          | `/agon debate` | Adversarial stress-testing               |
| `/abraxas:analyze`   | Logos         | `/logos map`   | Structural argument mapping              |
| `/abraxas:dream`     | Oneironautics | `/receive`     | Dream receiving and interpretation       |
| `/abraxas:shadow`    | Oneironautics | `/audit`       | Shadow auditing                          |
| `/abraxas:inspect`   | Janus         | `/qualia`      | Internal state inspection                |
| `/abraxas:integrate` | Oneironautics | `/integrate`   | Symbolic integration                     |

## Composite Workflows

| Alias             | Target Systems       | Sequence                                           | Description                                                |
|:------------------|:---------------------|:---------------------------------------------------|:-----------------------------------------------------------|
| `/abraxas:mode`   | Janus                | Selection $\rightarrow$ `/sol` or `/nox`           | Switch between a factual and symbolic mindset              |
| `/abraxas:status` | Janus, Oneironautics | `/threshold status` $\rightarrow$ `/ledger status` | Unified health check of the epistemic and symbolic systems |
