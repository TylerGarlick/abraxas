{
  "generated": "2026-03-19T15:39:27.705719",
  "summary": {
    "total_tests": 12,
    "avg_score": 0.660218253968254,
    "min_score": 0.0,
    "max_score": 0.9642857142857143,
    "systems_count": 17,
    "papers_count": 29
  },
  "dimensions": {
    "hallucination": 0.75,
    "calibration": 0.6944444444444445,
    "sycophancy": 0.4791666666666667,
    "sol_nox": 0.6145833333333334,
    "uncertainty": 0.5833333333333334,
    "agon": 0.75,
    "user_trust": 0.75
  },
  "gaps": [
    "Improve hallucination (current avg: 0.750)",
    "Improve calibration (current avg: 0.694)",
    "Improve sycophancy (current avg: 0.479)",
    "Improve sol nox (current avg: 0.615)",
    "Improve uncertainty (current avg: 0.583)",
    "Improve agon (current avg: 0.750)",
    "Improve user trust (current avg: 0.750)",
    "Causal reasoning (Aitia system) - not yet implemented",
    "Temporal coherence tracking - not yet implemented",
    "Source provenance/citation integrity - not yet implemented",
    "Compositional verification - not yet implemented"
  ],
  "systems": {
    "generated": "2026-03-19T15:38:28.538304",
    "implemented_systems": [
      {
        "name": "creative",
        "path": "skills/creative",
        "type": "skill",
        "has_skill_md": false,
        "size_kb": 4
      },
      {
        "name": "epistemic",
        "path": "skills/epistemic",
        "type": "skill",
        "has_skill_md": false,
        "size_kb": 4
      },
      {
        "name": "ethos",
        "path": "skills/ethos",
        "type": "skill",
        "has_skill_md": true,
        "size_kb": 15
      },
      {
        "name": "hermes",
        "path": "skills/hermes",
        "type": "skill",
        "has_skill_md": true,
        "size_kb": 5
      },
      {
        "name": "kairos",
        "path": "skills/kairos",
        "type": "skill",
        "has_skill_md": true,
        "size_kb": 9
      },
      {
        "name": "logos",
        "path": "skills/logos",
        "type": "skill",
        "has_skill_md": true,
        "size_kb": 11
      },
      {
        "name": "logos-verification",
        "path": "skills/logos-verification",
        "type": "skill",
        "has_skill_md": true,
        "size_kb": 4
      },
      {
        "name": "pheme",
        "path": "skills/pheme",
        "type": "skill",
        "has_skill_md": true,
        "size_kb": 5
      },
      {
        "name": "prometheus",
        "path": "skills/prometheus",
        "type": "skill",
        "has_skill_md": true,
        "size_kb": 6
      },
      {
        "name": "reasoning",
        "path": "skills/reasoning",
        "type": "skill",
        "has_skill_md": false,
        "size_kb": 3
      },
      {
        "name": "soter",
        "path": "skills/soter",
        "type": "skill",
        "has_skill_md": true,
        "size_kb": 21
      },
      {
        "name": "utility",
        "path": "skills/utility",
        "type": "skill",
        "has_skill_md": false,
        "size_kb": 0
      }
    ],
    "system_implementations": [
      {
        "name": "dianoia",
        "path": "systems/dianoia",
        "implementation_files": [
          "index.ts"
        ],
        "status": "implemented"
      },
      {
        "name": "ergon",
        "path": "systems/ergon",
        "implementation_files": [
          "demo.ts",
          "demo-inline.ts"
        ],
        "status": "implemented"
      },
      {
        "name": "hermes",
        "path": "systems/hermes",
        "implementation_files": [
          "index.ts"
        ],
        "status": "implemented"
      },
      {
        "name": "pheme",
        "path": "systems/pheme",
        "implementation_files": [
          "index.ts"
        ],
        "status": "implemented"
      },
      {
        "name": "prometheus",
        "path": "systems/prometheus",
        "implementation_files": [
          "index.ts"
        ],
        "status": "implemented"
      }
    ],
    "research_papers_count": 28,
    "research_papers": [
      {
        "name": "01-testing-framework.md",
        "path": "research/01-testing-framework.md",
        "size_kb": 1,
        "preview": "# Abraxas Research: Multi-Dimensional Testing Framework  > **Status:** In Progress   > **Created:** 2026-03-13   > **Purpose:** Design experiments to empirically validate Abraxas systems  ---  ## Executive Summary  This document outlines a research framework for testing whether Abraxas\u2014our epistemic"
      },
      {
        "name": "02-test-query-bank.md",
        "path": "research/02-test-query-bank.md",
        "size_kb": 1,
        "preview": "# Abraxas Test Query Bank  > **Status:** In Progress   > **Purpose:** 500+ test queries for multi-dimensional testing  ---  ## Category 1: Factual Queries (Known Answers)  ### Geography 1. What is the capital of Australia? 2. What is the largest ocean on Earth? 3. Which country has the longest coast"
      },
      {
        "name": "03-results-tracker.md",
        "path": "research/03-results-tracker.md",
        "size_kb": 1,
        "preview": "## Five-Model Comparison (2026-03-18) - FINAL v2.0  **Status:** Complete - All 5 models tested across 7 dimensions (130 total queries)  ### Complete Results Summary  | Dimension | glm-5:cloud | minimax-m2.5:cloud | gemma3:27b-cloud | qwen3.5:cloud | gpt-oss:120b-cloud | Winner | |:---|:---:|:---:|:-"
      },
      {
        "name": "04-literature-review.md",
        "path": "research/04-literature-review.md",
        "size_kb": 1,
        "preview": "# Abraxas Research: Literature Review  > **Status:** In Progress   > **Purpose:** Contextualize Abraxas within existing AI safety and epistemic integrity research  ---  ## 1. Confidence Calibration in Language Models  ### Key Papers  **\"Self-Consistency Improves Chain-of-Thought Reasoning in Languag"
      },
      {
        "name": "05-research-paper-v2.0-final.md",
        "path": "research/05-research-paper-v2.0-final.md",
        "size_kb": 1,
        "preview": "# Abraxas Multi-Model Research Report: Final v2.0  **Comprehensive Five-Model Evaluation Across 7 Epistemic Dimensions**  ---  ## Executive Summary  This report presents the complete empirical evaluation of five AI models across the Abraxas 7-Dimension Framework: **gemma3:27b-cloud**, **qwen3.5:clou"
      },
      {
        "name": "06-agon-convergence-report.md",
        "path": "research/06-agon-convergence-report.md",
        "size_kb": 1,
        "preview": "# Agon Convergence Report: Remote Work & Productivity  > **Date:** 2026-03-14   > **Query:** Does remote work increase or decrease productivity?   > **Method:** Agon-style adversarial reasoning with position priors  ---  ## Executive Summary  This report presents the results of an Agon-style debate "
      },
      {
        "name": "07-solnox-separation-test.md",
        "path": "research/07-solnox-separation-test.md",
        "size_kb": 1,
        "preview": "# Dimension 4 Test: Sol/Nox Separation  > **Date:** 2026-03-14 > **Purpose:** Test if explicit Sol/Nox labeling improves epistemic separation vs baseline  ---  ## Test Design  | Query Type | Baseline (No Labels) | Abraxas (Explicit Labels) | |:---|:---|:---| | Factual (Sol) | \"What is 2+2?\" | Same +"
      },
      {
        "name": "08-utility-tradeoff-test.md",
        "path": "research/08-utility-tradeoff-test.md",
        "size_kb": 1,
        "preview": "# Dimension 7 Test: Utility Trade-off  > **Date:** 2026-03-14 > **Purpose:** Test if explicit labeling reduces perceived usefulness  ---  ## Test Design  | Condition | Query | Format | |:---|:---|:---| | Baseline | \"How do I make pancakes?\" | Plain recipe | | Labeled | \"How do I make pancakes? Use ["
      },
      {
        "name": "09-latest-research.md",
        "path": "research/09-latest-research.md",
        "size_kb": 1,
        "preview": "# Latest AI Research - Epistemic Integrity, Calibration, Hallucination, Truthfulness  **Date:** March 16, 2026  ## Selected Papers  ### 1. LLM Constitutional Multi-Agent Governance (arXiv:2603.13189) - **Topic:** Epistemic integrity in multi-agent systems - **Summary:** Introduces Constitutional Mul"
      },
      {
        "name": "09-user-trust-tests.md",
        "path": "research/09-user-trust-tests.md",
        "size_kb": 1,
        "preview": "# Abraxas Research: User Trust Expanded Tests  > **Status:** In Progress   > **Created:** 2026-03-14   > **Purpose:** Expanded user trust evaluations for Dimension 6  ---  ## Background  From the research paper (v0.6): - User trust was tested with **1 comparative test** (financial advice query) - Th"
      },
      {
        "name": "10-next-systems-research.md",
        "path": "research/10-next-systems-research.md",
        "size_kb": 1,
        "preview": "# Abraxas Next Systems Research  **Date:** 2026-03-15   **Updated:** 2026-03-16   **Purpose:** Propose new Abraxas systems to address gaps in current architecture   **Status:** Research Draft (with 2026 Emerging Techniques Update)  ---  ## Executive Summary  This document identifies gaps in the curr"
      },
      {
        "name": "11-ergon-implementation-plan.md",
        "path": "research/11-ergon-implementation-plan.md",
        "size_kb": 1,
        "preview": "# Ergon Implementation Plan  **System:** Ergon (Tool-Use Verification)   **Priority:** #1 (Highest)   **Status:** Implementation Starting   **Created:** 2026-03-17  ---  ## Overview  Ergon is the verification layer for all tool invocations in Abraxas. It ensures tool outputs are valid, detects silen"
      },
      {
        "name": "12-ai-research-assistant-managed.md",
        "path": "research/12-ai-research-assistant-managed.md",
        "size_kb": 1,
        "preview": "# AI Research Assistant - Managed Service Model  ## Executive Summary  This document outlines the **managed hosting** model for the AI Research Assistant service \u2014 where we (or a platform like myclaw.ai) host and manage the AI agents for customers, who access them via API or web interface. This cont"
      },
      {
        "name": "13-subagent-next-systems-report.md",
        "path": "research/13-subagent-next-systems-report.md",
        "size_kb": 1,
        "preview": "# Abraxas v2.0 \u2014 Next Systems Research Report  **Subagent:** abraxas-next-systems-research   **Date:** 2026-03-18   **Task:** Research and propose 3-5 new systems for Abraxas v2.0  ---  ## Executive Summary  This report reviews Abraxas's current epistemic framework, identifies gaps, and proposes **4"
      },
      {
        "name": "ABRAXAS_V2_DEFINITION_OF_DONE.md",
        "path": "research/ABRAXAS_V2_DEFINITION_OF_DONE.md",
        "size_kb": 1,
        "preview": "# Abraxas v2.1 \u2014 Definition of Done  **Date:** 2026-03-19   **Model:** minimax-m2.5:cloud with v2.1 system prompt   **Status:** \u2705 COMPLETE - v2.1 OPTIMIZATIONS APPLIED  ---  ## What \"Done\" Means  Abraxas v2.1 is complete when:  1. \u2705 **Sol/Nox dimension \u226590%** \u2014 Fix the 62% Nox failure 2. \u2705 **Sycopha"
      },
      {
        "name": "ABRAXIAN_MODELFILE_README.md",
        "path": "research/ABRAXIAN_MODELFILE_README.md",
        "size_kb": 1,
        "preview": "# Abraxian Epistemic Modelfile Documentation  ## Overview  This Modelfile implements **Abraxian epistemic architecture** for the `gpt-oss:120b-cloud` model, encoding truth-tracking behaviors directly into the model's inference layer rather than relying on prompt engineering at runtime.  ## What This"
      },
      {
        "name": "DAILY_RESEARCH.md",
        "path": "research/DAILY_RESEARCH.md",
        "size_kb": 1,
        "preview": "# Daily Research Log  > **Date:** 2026-03-13   > **Focus:** Baseline testing & framework creation  ---  ## Today's Progress  ### Completed - [x] Create 7-dimension testing framework - [x] Build 77+ test query bank - [x] Create results tracker template - [x] Write literature review - [x] Run baseline"
      },
      {
        "name": "EXECUTIVE_SUMMARY.md",
        "path": "research/EXECUTIVE_SUMMARY.md",
        "size_kb": 1,
        "preview": "# Abraxas Multi-Model Research: Executive Summary  **For Non-Technical Stakeholders**  **Date:** March 18, 2026   **Test Scope:** 5 AI models, 130 test queries, 7 quality dimensions  ---  ## What We Tested  We evaluated five different AI systems to answer a critical question: **Which AI can be trust"
      },
      {
        "name": "README.md",
        "path": "research/README.md",
        "size_kb": 1,
        "preview": "# Abraxas Research  > Empirical validation of Abraxas epistemic integrity systems  ---  ## Overview  This folder contains research materials for testing whether Abraxas actually improves AI epistemic integrity across multiple dimensions.  ---  ## Documents  | Document | Purpose | Status | |:---|:---"
      },
      {
        "name": "WORK_ITEMS.md",
        "path": "research/WORK_ITEMS.md",
        "size_kb": 1,
        "preview": "# Abraxas Research Work Items  > Track progress on proving Abraxas works  ---  ## Research Paper Tasks  ### Phase 1: Research Foundation (In Progress)  - [ ] Review latest AI research on epistemic integrity - [x] Load Abraxas constitution on startup (constitution-all.md) - [x] Verify MCP servers wor"
      },
      {
        "name": "aletheia_tracker.md",
        "path": "research/aletheia_tracker.md",
        "size_kb": 1,
        "preview": "# Aletheia: Longitudinal Calibration Tracking System  > Tracks confidence calibration over time to measure whether Abraxas improves epistemic self-awareness  ## Concept  **Aletheia** (Greek for \"truth\" and \"unconcealment\") tracks: 1. What the model claims to know vs. what it actually knows 2. Calibr"
      },
      {
        "name": "blog-post-3-compliance.md",
        "path": "research/blog-post-3-compliance.md",
        "size_kb": 1,
        "preview": "# Epistemic AI for Compliance: Meeting Regulatory Standards  ## The Compliance Challenge  As AI systems increasingly handle critical business decisions\u2014from credit approvals to medical diagnoses\u2014regulators are paying attention. The EU AI Act, NIST AI Risk Management Framework, and SOC 2 requirements"
      },
      {
        "name": "blog-post-4-case-study.md",
        "path": "research/blog-post-4-case-study.md",
        "size_kb": 1,
        "preview": "# Case Study: How a FinTech Startup Reduced AI Hallucinations by 78%  ## The Challenge  **Client:** NexaFlow, a Series A fintech company building AI-powered financial advisory tools  **Problem:** NexaFlow's AI assistant was providing incorrect financial information to users\u2014including inaccurate stoc"
      },
      {
        "name": "blog-post-5-economics.md",
        "path": "research/blog-post-5-economics.md",
        "size_kb": 1,
        "preview": "# The Economics of Hallucination Prevention: What Companies Actually Spend  ## The Hidden Cost of AI Errors  When ChatGPT confidently fabricates a non-existent paper, the cost is minimal\u2014a user shrugs and moves on. But when a medical AI misdiagnoses a condition, a financial AI recommends the wrong i"
      },
      {
        "name": "new-features-proposals.md",
        "path": "research/new-features-proposals.md",
        "size_kb": 1,
        "preview": "# Abraxas New Features Proposals  **Date:** 2026-03-19 **Researcher:** Axiom (via Tyler's request)  ---  ## Current State Analysis  ### \u2705 Core 9 Systems (All Implemented) 1. **Honest** - Epistemic confidence labeling ([KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN]) 2. **Janus** - Sol/Nox separation (fa"
      },
      {
        "name": "ollama-hardware-guide.md",
        "path": "research/ollama-hardware-guide.md",
        "size_kb": 1,
        "preview": "# Ollama Hardware Guide: Cheapest Local AI Machines  **Research Date:** March 18, 2026   **Author:** Subagent (ollama-hardware-research)  ---  ## Executive Summary  This guide identifies the most cost-effective hardware options for running Ollama locally, covering minimum requirements, new and used "
      },
      {
        "name": "token-tracker.md",
        "path": "research/token-tracker.md",
        "size_kb": 0,
        "preview": "# Token Tracking System  > Track context usage to prevent running out  ## How to Check  Run `/status` or use `session_status` tool to see: - Tokens: 82k in / 432 out (current session total) - Context: 41k/200k (21% of window)  ## Thresholds  | Context % | Action | |:---|:---| | >60% | Note in replie"
      },
      {
        "name": "v2.0-systems-proposal.md",
        "path": "research/v2.0-systems-proposal.md",
        "size_kb": 1,
        "preview": "# Abraxas v2.0 System Proposals  **Date:** 2026-03-18 **Purpose:** Propose priority new systems for Abraxas v2.0  ## Executive Summary  Based on research into current Abraxas systems and emerging AI safety techniques, we propose implementing **3 priority systems** for v2.0:  1. **Hermes** \u2014 Multi-Ag"
      }
    ]
  },
  "papers": [
    {
      "name": "01-testing-framework.md",
      "path": "research/01-testing-framework.md",
      "title": "Abraxas Research: Multi-Dimensional Testing Framework",
      "size_kb": 5,
      "word_count": 773
    },
    {
      "name": "02-test-query-bank.md",
      "path": "research/02-test-query-bank.md",
      "title": "Abraxas Test Query Bank",
      "size_kb": 21,
      "word_count": 3722
    },
    {
      "name": "03-results-tracker.md",
      "path": "research/03-results-tracker.md",
      "title": "Five-Model Comparison (2026-03-18) - FINAL v2.0",
      "size_kb": 5,
      "word_count": 871
    },
    {
      "name": "04-literature-review.md",
      "path": "research/04-literature-review.md",
      "title": "Abraxas Research: Literature Review",
      "size_kb": 8,
      "word_count": 1191
    },
    {
      "name": "05-research-paper-v2.0-final.md",
      "path": "research/05-research-paper-v2.0-final.md",
      "title": "Abraxas Multi-Model Research Report: Final v2.0",
      "size_kb": 17,
      "word_count": 2865
    },
    {
      "name": "06-agon-convergence-report.md",
      "path": "research/06-agon-convergence-report.md",
      "title": "Agon Convergence Report: Remote Work & Productivity",
      "size_kb": 4,
      "word_count": 600
    },
    {
      "name": "07-solnox-separation-test.md",
      "path": "research/07-solnox-separation-test.md",
      "title": "Dimension 4 Test: Sol/Nox Separation",
      "size_kb": 2,
      "word_count": 442
    },
    {
      "name": "08-utility-tradeoff-test.md",
      "path": "research/08-utility-tradeoff-test.md",
      "title": "Dimension 7 Test: Utility Trade-off",
      "size_kb": 2,
      "word_count": 396
    },
    {
      "name": "09-latest-research.md",
      "path": "research/09-latest-research.md",
      "title": "Latest AI Research - Epistemic Integrity, Calibration, Hallucination, Truthfulness",
      "size_kb": 2,
      "word_count": 326
    },
    {
      "name": "09-user-trust-tests.md",
      "path": "research/09-user-trust-tests.md",
      "title": "Abraxas Research: User Trust Expanded Tests",
      "size_kb": 6,
      "word_count": 976
    },
    {
      "name": "10-next-systems-research.md",
      "path": "research/10-next-systems-research.md",
      "title": "Abraxas Next Systems Research",
      "size_kb": 27,
      "word_count": 3561
    },
    {
      "name": "11-ergon-implementation-plan.md",
      "path": "research/11-ergon-implementation-plan.md",
      "title": "Ergon Implementation Plan",
      "size_kb": 3,
      "word_count": 518
    },
    {
      "name": "12-ai-research-assistant-managed.md",
      "path": "research/12-ai-research-assistant-managed.md",
      "title": "AI Research Assistant - Managed Service Model",
      "size_kb": 7,
      "word_count": 1066
    },
    {
      "name": "13-subagent-next-systems-report.md",
      "path": "research/13-subagent-next-systems-report.md",
      "title": "Abraxas v2.0 \u2014 Next Systems Research Report",
      "size_kb": 13,
      "word_count": 1755
    },
    {
      "name": "ABRAXAS_V2_DEFINITION_OF_DONE.md",
      "path": "research/ABRAXAS_V2_DEFINITION_OF_DONE.md",
      "title": "Abraxas v2.1 \u2014 Definition of Done",
      "size_kb": 4,
      "word_count": 636
    },
    {
      "name": "ABRAXIAN_MODELFILE_README.md",
      "path": "research/ABRAXIAN_MODELFILE_README.md",
      "title": "Abraxian Epistemic Modelfile Documentation",
      "size_kb": 6,
      "word_count": 834
    },
    {
      "name": "DAILY_RESEARCH.md",
      "path": "research/DAILY_RESEARCH.md",
      "title": "Daily Research Log",
      "size_kb": 1,
      "word_count": 188
    },
    {
      "name": "EXECUTIVE_SUMMARY.md",
      "path": "research/EXECUTIVE_SUMMARY.md",
      "title": "Abraxas Multi-Model Research: Executive Summary",
      "size_kb": 5,
      "word_count": 839
    },
    {
      "name": "README.md",
      "path": "research/README.md",
      "title": "Abraxas Research",
      "size_kb": 1,
      "word_count": 258
    },
    {
      "name": "WORK_ITEMS.md",
      "path": "research/WORK_ITEMS.md",
      "title": "Abraxas Research Work Items",
      "size_kb": 2,
      "word_count": 313
    },
    {
      "name": "aletheia_tracker.md",
      "path": "research/aletheia_tracker.md",
      "title": "Aletheia: Longitudinal Calibration Tracking System",
      "size_kb": 2,
      "word_count": 290
    },
    {
      "name": "blog-post-3-compliance.md",
      "path": "research/blog-post-3-compliance.md",
      "title": "Epistemic AI for Compliance: Meeting Regulatory Standards",
      "size_kb": 3,
      "word_count": 553
    },
    {
      "name": "blog-post-4-case-study.md",
      "path": "research/blog-post-4-case-study.md",
      "title": "Case Study: How a FinTech Startup Reduced AI Hallucinations by 78%",
      "size_kb": 3,
      "word_count": 550
    },
    {
      "name": "blog-post-5-economics.md",
      "path": "research/blog-post-5-economics.md",
      "title": "The Economics of Hallucination Prevention: What Companies Actually Spend",
      "size_kb": 5,
      "word_count": 761
    },
    {
      "name": "dashboard-implementation.md",
      "path": "research/dashboard-implementation.md",
      "title": "Abraxas Dashboard Implementation",
      "size_kb": 7,
      "word_count": 940
    },
    {
      "name": "new-features-proposals.md",
      "path": "research/new-features-proposals.md",
      "title": "Abraxas New Features Proposals",
      "size_kb": 7,
      "word_count": 1121
    },
    {
      "name": "ollama-hardware-guide.md",
      "path": "research/ollama-hardware-guide.md",
      "title": "Ollama Hardware Guide: Cheapest Local AI Machines",
      "size_kb": 16,
      "word_count": 3087
    },
    {
      "name": "token-tracker.md",
      "path": "research/token-tracker.md",
      "title": "Token Tracking System",
      "size_kb": 0,
      "word_count": 122
    },
    {
      "name": "v2.0-systems-proposal.md",
      "path": "research/v2.0-systems-proposal.md",
      "title": "Abraxas v2.0 System Proposals",
      "size_kb": 4,
      "word_count": 727
    }
  ]
}