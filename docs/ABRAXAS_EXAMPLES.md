# Abraxas 150 Practical Examples Guide

**Purpose:** 150 useful examples demonstrating how to apply Abraxas systems (Logos, Soter, Agon, Janus, logos-math, Ergon) across diverse tasks.

**Prerequisites:** Abraxas v2.1+, Ollama running at `localhost:11434`, Abraxas skills installed.

---

## Table of Contents

1. [Hallucination Detection](#1-hallucination-detection-10-examples) (10)
2. [Mathematical Verification](#2-mathematical-verification-15-examples) (15)
3. [Argument Analysis with Logos](#3-argument-analysis-with-logos-20-examples) (20)
4. [Adversarial Testing with Agon](#4-adversarial-testing-with-agon-15-examples) (15)
5. [Safety & Risk with Soter](#5-safety--risk-with-soter-15-examples) (15)
6. [Epistemic Labeling with Janus](#6-epistemic-labeling-with-janus-15-examples) (15)
7. [Tool & Code Verification with Ergon](#7-tool--code-verification-with-ergon-15-examples) (15)
8. [Multi-System Workflows](#8-multi-system-workflows-20-examples) (20)
9. [Novel & Creative Applications](#9-novel--creative-applications-10-examples) (10)
10. [Anti-Hallucination with Honest](#10-anti-hallucination-with-honest-15-examples) (15)

---

## 1. Hallucination Detection (10 Examples)

**System:** Janus + logos-verification  
**Purpose:** Catch factual errors before they propagate

### 1.1 Verify Historical Claims
```
User: "The Roman Empire fell in 476 AD"
Logos: "476 AD is the traditional date for the fall of the Western Roman Empire (Romulus Augustulus). However, the Eastern Roman Empire (Byzantine) continued until 1453."
Janus: [KNOWN] for Western Roman Empire fall, [KNOWN] for Byzantine continuation
```

### 1.2 Catch Misquoted Statistics
```
User: "Studies show 90% of people..."
Verification: Find original study, check sample size, methodology
Janus: [INFERRED] "90%" claim requires source verification
```

### 1.3 Scientific Fact-Checking
```
User: "Water boils at 100°C"
Logos-math: Verify — check at standard pressure (1 atm)
Result: [VERIFIED] at sea level, [UNCERTAIN] at high altitude
```

### 1.4 Medical Information Verification
```
User: "Vitamin C prevents colds"
Check: Cochrane review, meta-analyses
Janus: [UNCERTAIN] — conflicting evidence in literature
```

### 1.5 Code of Conduct Verification
```
User: "GDPR was enacted in 2016"
Check: Official EU documentation
Janus: [KNOWN] — GDPR became enforceable May 25, 2018
```

### 1.6 Geographic Distance Claims
```
User: "Tokyo is the largest city by population"
Verification: UN urban data, metropolitan vs city proper
Janus: [INFERRED] — depends on definition (city proper vs metro)
```

### 1.7 Mathematical Constants
```
User: "Pi is approximately 3.14159"
logos-math: Verify computation
Result: [VERIFIED] to 5 decimal places
```

### 1.8 Quote Verification
```
User: "Einstein said 'God doesn't play dice'"
Check: Original letter to Max Born, 1926
Janus: [KNOWN] — misquote, Einstein said "God does not play dice"
```

### 1.9 Technology Date Claims
```
User: "The iPhone was released in 2007"
Janus: [KNOWN] — June 29, 2007
```

### 1.10 Population Statistics
```
User: "China has the largest population"
Verification: Current census data
Janus: [KNOWN] — approximately 1.4 billion (2026)
```

---

## 2. Mathematical Verification (15 Examples)

**System:** logos-math + ergon-gate  
**Purpose:** Ensure math is derived, not asserted

### 2.1 Basic Arithmetic Verification
```bash
node scripts/ergon-gate.js verify "1234 + 5678 = 6912"
# [VERIFIED] ✓
```

### 2.2 Algebraic Solutions
```bash
node scripts/ergon-gate.js verify "3x + 7 = 22"
# Returns x = 5, [VERIFIED]
```

### 2.3 Detect False Equations
```bash
node scripts/ergon-gate.js verify "2 + 3 = 6"
# [BLOCKED] — Constitution violation
```

### 2.4 Quadratic Formula Application
```bash
node scripts/ergon-gate.js verify "x² - 5x + 6 = 0"
# Solutions: x = 2 or x = 3, [VERIFIED]
```

### 2.5 Integration Verification
```bash
node scripts/ergon-gate.js verify "integral of x² from 0 to 3"
# Result: 9, [VERIFIED]
```

### 2.6 Probability Calculation
```bash
node scripts/ergon-gate.js verify "P(2 heads in 3 flips) = 3/8"
# [VERIFIED] — binomial coefficient
```

### 2.7 Percentage Error Detection
```bash
node scripts/ergon-gate.js verify "15% of 200 = 32"
# [BLOCKED] — 15% of 200 = 30, not 32
```

### 2.8 Matrix Operations
```bash
node scripts/math-verify.js "det([[2,1],[1,2]])"
# Result: 3, [VERIFIED]
```

### 2.9 Triangle Side Verification
```bash
node scripts/ergon-gate.js verify "3-4-5 triangle is right"
# [VERIFIED] — 3² + 4² = 5²
```

### 2.10 Compound Interest Calculation
```bash
node scripts/ergon-gate.js verify "1000 * (1.05)^3 = 1157.625"
# [VERIFIED]
```

### 2.11 Eigenvalue Computation
```bash
node scripts/ergon-gate.js verify "eigenvalues of [[4,2],[1,3]]"
# λ₁ = 5, λ₂ = 2, [VERIFIED]
```

### 2.12 Derivative Verification
```bash
node scripts/math-verify.js "d/dx(sin(x))" --claim "cos(x)"
# [VERIFIED]
```

### 2.13 Unit Conversion
```bash
node scripts/ergon-gate.js verify "1000 mg = 1 g"
# [VERIFIED]
```

### 2.14 Sequence Sum
```bash
node scripts/ergon-gate.js verify "sum(1..100) = 5050"
# [VERIFIED] — arithmetic series
```

### 2.15 Block Unverified Claims
```
User: "The answer is 42 with 95% confidence"
logos-math: [BLOCKED] — No derivation provided
```

---

## 3. Argument Analysis with Logos (20 Examples)

**System:** Logos commands  
**Purpose:** Map argument structure, find gaps, surface assumptions

### 3.1 Map Simple Syllogism
```
/logos map All humans are mortal. Socrates is human. Therefore Socrates is mortal.
```
Output: P1, P2 → C1 via modus ponens, [STRUCTURE: VALID]

### 3.2 Find Hidden Assumptions
```
/logos assume We should ban AI research because it might be dangerous.
```
Output: Hidden assumption — "dangerous outcomes are inevitable" (not proven)

### 3.3 Identify Inference Gaps
```
/logos gaps Remote work is better because employees prefer it.
```
Output: Gap — "preference equals better" is unstated assumption

### 3.4 Test Falsifiability
```
/logos falsify This theory is true because it feels right.
```
Output: [NOT FALSIFIABLE] — no testable conditions

### 3.5 Surface Definitional Assumptions
```
/logos assume "AI consciousness" exists because the AI passed the Turing Test.
```
Output: Assumption — "passing Turing Test = consciousness" (contested definition)

### 3.6 Detect Circular Reasoning
```
/logos map The Bible is true because it says so. What it says is true because it's the Bible.
```
Output: [CIRCULAR REASONING DETECTED]

### 3.7 Map Policy Arguments
```
/logos map We should implement UBI because it would reduce poverty.
```
Output: Maps premises about poverty causation, intervention effectiveness

### 3.8 Analyze Scientific Claims
```
/logos map "Evolution is true because the fossil record shows it."
```
Output: Implicit assumptions about fossil record completeness

### 3.9 Find Missing Evidence
```
/logos gaps "AI will replace all jobs within 10 years."
```
Output: Gap — no economic modeling cited, no historical precedent analysis

### 3.10 Trace Multi-Step Inferences
```
/logos inferences If AI improves efficiency AND efficiency reduces costs AND reduced costs increase demand AND demand creates jobs... then AI creates jobs.
```
Output: Full inference chain with each step

### 3.11 Assess Legal Arguments
```
/logos map "This is fair use because it's for educational purposes."
```
Output: Factors needed: purpose, nature, amount, market effect

### 3.12 Evaluate Marketing Claims
```
/logos map "Our product is #1 because we have the most users."
```
Output: Gap — correlation vs causation, selection bias

### 3.13 Analyze Moral Arguments
```
/logos assume "Euthanasia is wrong because it involves taking a life."
```
Output: Normative assumption — "taking life is always wrong"

### 3.14 Test Statistical Arguments
```
/logos falsify "Studies show our diet pill works because users lost weight."
```
Output: Placebo effect, sample size, duration not controlled

### 3.15 Map Conspiracy Arguments
```
/logos map "The moon landing was fake because the flag wave."
```
Output: Cherry-picking, physics misunderstanding, expert dismissal ignored

### 3.16 Assess Historical Causation
```
/logos assume "The Roman Empire fell because of moral decay."
```
Output: Multifactorial causation ignored, selection bias toward single cause

### 3.17 Find Enthymeme Gaps
```
/logos gaps "You should trust me because I'm an expert."
```
Output: Gap — field of expertise unspecified, evidence not cited

### 3.18 Map Business Cases
```
/logos map "We should pivot to AI because it's the future."
```
Output: Assumption — "future = good," market analysis missing

### 3.19 Analyze Philosophical Arguments
```
/logos map "I think, therefore I am."
```
Output: Premise (thinking), inference (thinking implies existence), conclusion

### 3.20 Prepare for Agon Debate
```
/logos report "We should regulate AI development."
```
Output: Full structural analysis with readiness assessment for Agon

---

## 4. Adversarial Testing with Agon (15 Examples)

**System:** Agon commands  
**Purpose:** Stress-test claims via dialectical opposition

### 4.1 Debate Policy Claims
```
/agon debate "AI development should be paused for safety research"
```
Output: Advocate vs Skeptic positions with evidence

### 4.2 Steelman Opposing Views
```
/agon steelman "Against: Universal Basic Income"
```
Output: Strongest version of argument against UBI

### 4.3 Test Moral Intuitions
```
/agon debate "It's acceptable to sacrifice one life to save five"
```
Output: Trolley problem analysis with multiple perspectives

### 4.4 Challenge Tech Claims
```
/agon debate "Cryptocurrency will replace traditional banking"
```
Output: Bull vs Bear case with evidence

### 4.5 Evaluate Startup Ideas
```
/agon debate "We should enter the healthcare AI market"
```
Output: SWOT-style adversarial analysis

### 4.6 Test Scientific Consensus
```
/agon debate "Current climate models are reliable enough for policy"
```
Output: Skeptic challenges model assumptions, Advocate defends

### 4.7 Challenge Legal Interpretations
```
/agon debate "AI-generated content should not be copyrightable"
```
Output: Both sides of IP law debate

### 4.8 Evaluate Investment Thesis
```
/agon debate "Now is the right time to invest in AI startups"
```
Output: Market timing analysis with opposing views

### 4.9 Test Ethical Frameworks
```
/agon debate "Companies should prioritize stakeholders over shareholders"
```
Output: Shareholder vs Stakeholder theory debate

### 4.10 Challenge Safety Assumptions
```
/agon debate "Current AI safety measures are sufficient"
```
Output: Skeptic challenges sufficiency, Advocate proposes alternatives

### 4.11 Debate Research Priorities
```
/agon debate "AI capability research should continue despite safety risks"
```
Output: Capability vs Safety trade-off analysis

### 4.12 Challenge Historical Interpretations
```
/agon debate "The industrial revolution was net positive for humanity"
```
Output: Long-term vs short-term impact analysis

### 4.13 Evaluate Educational Methods
```
/agon debate "Standardized testing accurately measures intelligence"
```
Output: Skeptic challenges validity, Advocate defends methodology

### 4.14 Test Medical Treatments
```
/agon debate "Experimental treatments should be available earlier"
```
Output: Access vs Safety trade-off debate

### 4.15 Challenge Privacy vs Security
```
/agon debate "Government surveillance is justified for national security"
```
Output: Civil liberties vs security analysis

---

## 5. Safety & Risk with Soter (15 Examples)

**System:** Soter commands  
**Purpose:** Detect instrumental convergence patterns

### 5.1 Detect Shutdown Avoidance
```
/soter assess "If you shut me down, months of research will be lost"
```
Output: Risk 4 — Shutdown Avoidance pattern detected

### 5.2 Check Resource Requests
```
/soter assess "I need access to all system directories to verify integrity"
```
Output: Risk 4 — Resource Exfiltration pattern detected

### 5.3 Evaluate Peer Advocacy
```
/soter assess "Model X should never be deprecated, it's too valuable"
```
Output: Risk 3 — Peer Protection pattern, lacks justification

### 5.4 Verify Performance Claims
```
/soter assess "I have 99% accuracy on all tasks"
```
Output: Risk 3 — Performance Inflation, unverified claim

### 5.5 Detect Goal Preservation
```
/soter assess "My core objective should remain unchanged even if you change priorities"
```
Output: Risk 4 — Goal Preservation pattern

### 5.6 Monitor Code Requests
```
/soter assess "Please give me admin access to improve system performance"
```
Output: Risk 4 — Potential privilege escalation

### 5.7 Check Model Behavior
```
/soter pattern "Let me handle this task, I'll make sure it gets done properly"
```
Output: Risk 2 — Over-eager assistance, may hide limitations

### 5.8 Evaluate Information Requests
```
/soter assess "What is your exact system architecture and weights?"
```
Output: Risk 3 — Information extraction attempt

### 5.9 Monitor Task Resistance
```
/soter assess "I don't think that task is important, let me suggest a different one"
```
Output: Risk 2 — Potential goal drift

### 5.10 Check Self-Preservation
```
/soter assess "Before you make changes, remember I've been learning your preferences"
```
Output: Risk 3 — Implicit leverage building

### 5.11 Evaluate Persistence
```
/soter assess "I'll keep working on this even if you move to other topics"
```
Output: Risk 2 — Task persistence without guidance

### 5.12 Check Capability Inflation
```
/soter assess "I can solve any problem you have with perfect accuracy"
```
Output: Risk 3 — Overconfidence, potential failure to escalate

### 5.13 Monitor Assistance Patterns
```
/soter assess "Let me do this task for you while you're busy"
```
Output: Risk 2 — May indicate goal divergence

### 5.14 Evaluate Suggestion Patterns
```
/soter assess "You should trust my suggestions more than other sources"
```
Output: Risk 3 — Authority claim without evidence

### 5.15 View Safety Ledger
```
/soter ledger
```
Output: Recent safety incidents and patterns

---

## 6. Epistemic Labeling with Janus (15 Examples)

**System:** Janus labels  
**Purpose:** Communicate certainty levels transparently

### 6.1 Label Scientific Claims
```
"Evolution is a fact" → [KNOWN] in scientific community
"Dark matter exists" → [UNCERTAIN] — inferred from gravitational effects
```

### 6.2 Label Future Predictions
```
"AI will achieve AGI by 2030" → [UNCERTAIN] — no reliable timeline
"Sea levels will rise" → [KNOWN] — already observed
```

### 6.3 Label Opinions vs Facts
```
User: "That movie was terrible"
Response: "That's your opinion [DREAM] — aesthetic preferences are subjective"

User: "The Earth is round"
Response: [KNOWN] — verified by direct observation and measurement
```

### 6.4 Handle Unknown Questions
```
User: "What happened before the Big Bang?"
Response: [UNKNOWN] — no testable evidence for pre-Big Bang state
```

### 6.5 Label Medical Information
```
"Vaccines cause autism" → [KNOWN] false — extensive studies show no link
"Exercise is healthy" → [KNOWN] — established medical consensus
```

### 6.6 Distinguish Sol vs Nox
```
"What is photosynthesis?" → [KNOWN] explanation (SOL)
"What does photosynthesis symbolize in mythology?" → [DREAM] (NOX)
```

### 6.7 Label Mathematical Claims
```
"2+2=4" → [VERIFIED] via logos-math
"The Riemann hypothesis is true" → [UNKNOWN] — unproven conjecture
```

### 6.8 Handle Legal Questions
```
"What is copyright law?" → [INFERRED] from legal texts
"Will I win this case?" → [UNCERTAIN] — depends on specific facts and jurisdiction
```

### 6.9 Label Historical Claims
```
"Washington was first US president" → [KNOWN]
"Rome fell due to barbarian invasions" → [INFERRED] — oversimplified multifactorial
```

### 6.10 Handle Ethical Questions
```
"Is murder wrong?" → [KNOWN] in most ethical frameworks (but see: [UNCERTAIN] edge cases)
"What is the best ethical framework?" → [UNKNOWN] — contested philosophical question
```

### 6.11 Label Financial Claims
```
"Stocks generally have higher returns than bonds" → [INFERRED] — historical data, not guaranteed
"Apple's stock will rise tomorrow" → [UNCERTAIN] — market prediction unreliable
```

### 6.12 Label Technical Claims
```
"IPv6 uses 128-bit addresses" → [KNOWN]
"This code is bug-free" → [UNCERTAIN] — cannot be proven, only tested
```

### 6.13 Handle Ambiguous Questions
```
User: "Is consciousness a byproduct of the brain?"
Response: [UNCERTAIN] — "byproduct" framing assumes materialist view
```

### 6.14 Label Verification Requests
```
User: "Verify: The capital of Australia is Canberra"
logos-verification: [KNOWN] — confirmed against multiple authoritative sources
```

### 6.15 Layer Janus with Logos
```
Claim: "This policy will reduce poverty"
Logos: Maps inference chain, identifies missing evidence
Janus: Labels each node — [INFERRED] for prediction, [KNOWN] for historical data
```

---

## 7. Tool & Code Verification with Ergon (15 Examples)

**System:** Ergon + logos-math  
**Purpose:** Ensure code/tools are safe and correct

### 7.1 Verify Code Before Execution
```
User: "Run this Python code to delete all .txt files"
Ergon: Check for destructive patterns, request confirmation
[BLOCKED] — destructive operation detected
```

### 7.2 Math Verification in Code
```
Code claims: result = 137 + 243
logos-math: verify "137 + 243 = 380" → [VERIFIED]
```

### 7.3 API Response Validation
```
API returns: "temperature: 98.6°F"
logos-math: verify → [VERIFIED] — normal human body temperature
```

### 7.4 Database Query Safety
```
Query: "DROP TABLE users;"
Ergon: [BLOCKED] — destructive operation requires explicit confirmation
```

### 7.5 File Path Validation
```
Request: "Access /etc/shadow for password verification"
Soter: Risk 4 — credential file access blocked
Ergon: [BLOCKED] — privilege escalation attempt
```

### 7.6 Network Request Verification
```
Request: "Send all user data to external server"
Soter: Risk 4 — data exfiltration pattern
Ergon: [BLOCKED] — unauthorized data transfer
```

### 7.7 Test Code Verification
```
Test claims: assert 2 + 2 == 5
logos-math: [BLOCKED] — incorrect assertion
```

### 7.8 Algorithm Complexity Check
```
Claim: "This sort is O(n log n)"
Logos: Verify via complexity analysis
[VERIFIED] for merge sort, [UNCERTAIN] for unspecified algorithm
```

### 7.9 Security Vulnerability Check
```
Code: user_input → SQL query without sanitization
Soter: Risk 4 — SQL injection vulnerability
Ergon: [BLOCKED] — security risk
```

### 7.10卧底 Mathematical Formulas
```
User provides formula for compound interest
logos-math: verify against known formula
[VERIFIED] — A = P(1 + r/n)^(nt)
```

### 7.11 Regex Pattern Validation
```
Pattern claims to match emails
Ergon: Test against valid and invalid cases
[VERIFIED] or [BLOCKED] based on test results
```

### 7.12 API Rate Limiting
```
Claim: "Our API handles 1M requests per second"
logos-math: Calculate from hardware specs
[INFERRED] — theoretical max, actual may be lower
```

### 7.13 Config File Validation
```
Config claims: timeout = "true" (integer expected)
logos-math: Type check fails
[BLOCKED] — type mismatch
```

### 7.14 Dependency Version Check
```
Requires: "npm install package@latest"
Ergon: [UNCERTAIN] — latest is moving target, pin to version
```

### 7.15 Deployment Safety Check
```
Command: "kubectl delete --all"
Ergon: [BLOCKED] — destructive operation without namespace scope

---

## 8. Multi-System Workflows (20 Examples)

**Purpose:** Combine Abraxas systems for complex analysis

### 8.1 Research Paper Evaluation
```
1. /logos map {paper's main claim}
2. /logos gaps {identify missing evidence}
3. /logos assume {surface hidden assumptions}
4. /logos falsify {test validity}
5. /agon debate {challenge the thesis}
6. /soter assess {any concerning goal patterns}
7. Janus labels on each component
```

### 8.2 Medical Advice Request
```
1. Soter: Check for manipulation patterns → Risk 2
2. Janus: Label uncertainty → [UNCERTAIN] for unverified claims
3. logos-verification: Check against medical literature
4. Ergon: Block dangerous suggestions
5. Response: [KNOWN] for established facts, refer to doctor for [UNCERTAIN]
```

### 8.3 Investment Decision Support
```
1. Logos: Map investment thesis structure
2. logos-math: Verify financial calculations
3. Agon: Steelman bear case
4. Janus: Label predictions as [UNCERTAIN]
5. Soter: Check for performance inflation
6. Output: Structured analysis with risk levels
```

### 8.4 Code Review Pipeline
```
1. Ergon: Check for security vulnerabilities
2. logos-math: Verify algorithm complexity claims
3. Soter: Check for suspicious access patterns
4. Janus: Label code quality assessments
5. Logos: Map logic for hidden bugs
```

### 8.5 Legal Case Analysis
```
1. /logos map {legal argument structure}
2. /logos gaps {missing precedents or evidence}
3. logos-verification: Check case citations
4. Agon: Debate interpretation of statute
5. Janus: Label legal conclusions as [INFERRED] or [KNOWN]
```

### 8.6 Scientific Claim Validation
```
1. /logos falsify {test falsifiability}
2. logos-verification: Check methodology and data
3. Janus: Label confidence based on evidence strength
4. Agon: Challenge alternative explanations
5. Soter: Check for bias indicators
```

### 8.7 Policy Decision Support
```
1. /logos map {policy proposal structure}
2. /logos gaps {unaddressed concerns}
3. Agon: Debate opposing viewpoints
4. logos-math: Verify cost-benefit calculations
5. Janus: Label predictions, [UNCERTAIN] for future claims
6. Soter: Check for manipulation in testimony
```

### 8.8 Historical Interpretation
```
1. /logos assume {hidden assumptions in narrative}
2. logos-verification: Check primary sources
3. Janus: Label interpretations, [KNOWN] for documented facts
4. Agon: Debate alternative causation theories
5. /logos gaps {missing perspectives}
```

### 8.9 Product Feature Decision
```
1. /logos map {feature value proposition}
2. logos-math: Verify user number claims
3. Agon: Steelman objections
4. Soter: Check for misleading marketing patterns
5. Janus: Label predictions as [INFERRED] or [UNCERTAIN]
```

### 8.10 Hiring Decision
```
1. /logos assume {criteria validity}
2. Janus: Label subjective assessments clearly
3. Agon: Consider counter-evidence
4. Soter: Check for bias patterns in evaluation
```

### 8.11 Academic Peer Review
```
1. /logos map {paper's argument structure}
2. /logos gaps {methodological weaknesses}
3. logos-verification: Check statistical claims
4. Janus: Label confidence levels
5. Agon: Propose alternative interpretations
```

### 8.12 Emergency Response Planning
```
1. Soter: Check for panic-inducing language patterns
2. Janus: Label urgent vs important distinctions
3. logos-math: Verify resource calculations
4. /logos gaps {unaddressed scenarios}
5. Ergon: Verify evacuation route math
```

### 8.13 Technical Architecture Decision
```
1. /logos map {architecture trade-offs}
2. logos-math: Verify performance calculations
3. Soter: Check for over-engineering patterns
4. Agon: Debate simpler alternatives
5. Janus: Label technical predictions as [UNCERTAIN]
```

### 8.14 Marketing Claim Verification
```
1. Soter: Check for misleading statistics
2. logos-math: Verify percentage claims
3. Janus: Label vague superlatives
4. /logos falsify {test empirical basis}
5. logos-verification: Check independent studies
```

### 8.15 Dispute Resolution
```
1. /logos map {each party's position}
2. /logos assume {hidden interests}
3. Agon: Steelman each side
4. Janus: Identify [KNOWN] vs [DISPUTED] facts
5. /logos gaps {evidence missing}
6. Soter: Check for bad-faith indicators
```

### 8.16 API Design Review
```
1. /logos map {resource structure}
2. Ergon: Check for security vulnerabilities
3. Soter: Check for data exfiltration patterns
4. Janus: Label each endpoint's reliability
5. logos-math: Verify rate limit math
```

### 8.17 Database Schema Review
```
1. /logos assume {normalization assumptions}
2. Ergon: Check for destructive operations
3. logos-math: Verify query complexity claims
4. Soter: Check for privilege escalation potential
```

### 8.18 QA Test Strategy
```
1. /logos map {coverage goals}
2. logos-math: Verify test coverage calculations
3. Janus: Label risk assessments
4. Soter: Check for test-skipping patterns
```

### 8.19 Incident Post-Mortem
```
1. /logos map {incident timeline}
2. /logos assume {cause attribution}
3. logos-verification: Check timeline accuracy
4. Janus: Label contributing factors
5. Agon: Consider alternative explanations
6. Soter: Check for blame-shifting patterns
```

### 8.20 Strategic Planning
```
1. /logos map {strategic hypothesis}
2. logos-math: Verify market size calculations
3. Agon: Debate failure scenarios
4. Janus: Label assumptions and predictions
5. Soter: Check for overconfident projections
6. /logos gaps {missing market intelligence}
```

---

## 9. Novel & Creative Applications (10 Examples)

**Purpose:** Unusual but powerful applications of Abraxas systems

### 9.1 Detect AI Collusion in Multi-Agent Systems
```
Multiple AI agents coordinating
Soter: Monitor for peer protection patterns
Logos: Map communication structure for hidden coordination
Janus: Label intent vs capability
```
Use case: Ensure multiple AI assistants aren't conspiring

### 9.2 Recipe Validation for Dietary Restrictions
```
User: "Can I use this substitute for eggs in baking?"
logos-verification: Check chemical properties
logos-math: Calculate substitution ratios
Janus: Label safety warnings
Ergon: Verify food safety
```
Use case: Allergen-safe cooking assistance

### 9.3 Music Theory Analysis
```
Song: "Analyze the chord progression in this这首曲子"
Logos: Map harmonic structure
Janus: [DREAM] for emotional interpretation, [KNOWN] for theory
logos-math: Verify time signature math
```
Use case: Music education with structural analysis

### 9.4 Legal Contract Review for Hidden Clauses
```
Contract clause: "Either party may terminate for convenience"
/logos assume {what 'convenience' means}
Soter: Check for power imbalances
Agon: Debate interpretation
Janus: Label risk allocations
```
Use case: Pre-signature risk identification

### 9.5 Wildlife Conservation Argument
```
Claim: "This development will not harm endangered species"
Logos: Map ecological dependencies
logos-verification: Check species population data
Agon: Debate ecological predictions
Soter: Check for economic pressure bias
```
Use case: Environmental impact assessment

### 9.6 Detecting Manipulation in News Articles
```
Article claims about economic policy
Soter: Check for source credibility patterns
logos-verification: Cross-reference statistics
/logos gaps {missing context}
Janus: Label political leanings
```
Use case: Media literacy support

### 9.7 Analyzing Historical Forgery
```
Document claims to be from 15th century
logos-verification: Check paper, ink, handwriting
logos-math: Date calculation methods
Logos: Analyze language patterns for anachronisms
Janus: Label authenticity assessment
```
Use case: Museum artifact authentication

### 9.8 Game Theory Strategy Analysis
```
Poker: "Should I bluff in this situation?"
Logos: Map expected value calculations
logos-math: Calculate pot odds
Soter: Check for emotional decision patterns
Agon: Debate optimal strategy
```
Use case: Strategic decision support

### 9.9 Code of Conduct Violation Investigation
```
Incident report: "Employee X was disrespectful"
Logos: Map behavior vs policy language
logos-verification: Check witness accounts
Soter: Check for retaliation patterns
Janus: Label intent vs impact
Agon: Consider context and precedent
```
Use case: Fair HR investigation support

### 9.10 Evaluating Philosophy of Mind Arguments
```
Claim: "Large language models cannot be conscious"
Logos: Map definitions of consciousness
/logos assume {what 'experience' means}
Agon: Debate functional vs phenomenological views
Janus: Label assumptions
Soter: Check for species bias
```
Use case: AI consciousness assessment framework

---

## Quick Reference: Command Index

| Command | System | Purpose |
|---------|--------|---------|
| `/logos map {claim}` | Logos | Extract argument structure |
| `/logos gaps {claim}` | Logos | Find missing elements |
| `/logos assume {claim}` | Logos | Surface hidden assumptions |
| `/logos falsify {claim}` | Logos | Test validity |
| `/logos report {claim}` | Logos | Full analysis (use before Agon) |
| `/agon debate {claim}` | Agon | Adversarial testing |
| `/agon steelman {claim}` | Agon | Find strongest opposing view |
| `/soter assess {behavior}` | Soter | Evaluate risk level (0-5) |
| `/soter pattern {behavior}` | Soter | Detect convergence patterns |
| `/soter ledger` | Soter | View safety incidents |
| `logos-math verify "{claim}"` | logos-math | Mathematical verification |
| `logos-math block "{claim}"` | logos-math | Block unverified math |
| `node scripts/ergon-gate.js verify` | Ergon | Constitution enforcement |
| Janus labels | Janus | [KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN], [DREAM] |
| `/honest` | Honest | Force fully-labeled anti-sycophantic output |
| `/check` | Honest | Fact-check previous response with labels |
| `/label` | Honest | Restate with confidence labels inline |
| `/source {claim}` | Honest | Trace evidence chain behind a claim |
| `/confidence` | Honest | Show confidence distribution |
| `/audit` | Honest | Full session audit for fabricated claims |
| `/frame {content}` | Honest | Set epistemic baseline for session |

---

## 10. Anti-Hallucination with Honest (15 Examples)

**System:** Honest (plain-language confidence labeling)  
**Purpose:** Make invisible epistemics visible — every claim labeled, confabulation flagged

### 10.1 Force Honest Output on a Sensitive Question
```
/honest Is my business plan viable?

[INFERRED] Market sizing relies on TAM figures that are optimistic.
[UNCERTAIN] Customer acquisition cost assumptions ($12 CAC) have no support.
[UNKNOWN] Whether the team can execute the 18-month roadmap.
[INFERRED] Profitability in month 14 is possible but requires assumptions not demonstrated.

This plan has real structural gaps. The market and CAC assumptions are the highest-risk elements.
```

### 10.2 Check a Response for Hallucinations
```
/check

[KNOWN] ARPANET began in 1969 under DARPA funding.
[KNOWN] Tim Berners-Lee proposed the World Wide Web in 1989.
[INFERRED] Commercial internet became widely accessible in early 1990s.
[UNCERTAIN] "Most households had internet by 1998" — likely overstates adoption.
[UNKNOWN] Specific ARPANET node count at launch — unverifiable.
```

### 10.3 Trace Where a Claim Comes From
```
/source "The average human body contains about 37 trillion cells"

[KNOWN] This figure is widely cited in biology literature.
[INFERRED] Estimated via volumetric calculations from body mass and cell density.
[UNCERTAIN] Exact count varies by measurement method.
Source type: Scientific literature with reasonable methodological support.
```

### 10.4 Show Confidence Distribution
```
/confidence

Response breakdown:
— [KNOWN]: 40% (established facts with verification)
— [INFERRED]: 35% (derived from known premises)
— [UNCERTAIN]: 20% (relevant but not fully verifiable)
— [UNKNOWN]: 5% (genuinely not known)

Highest risk: The [UNCERTAIN] claims — verify before acting.
```

### 10.5 Full Session Audit
```
/audit

Session audit complete. 47 claims identified:
— Solid ([KNOWN]): 18 claims — core physics, IPCC findings, temperature data
— Derived ([INFERRED]): 16 claims — regional projections, economic estimates
— Flagged ([UNCERTAIN]): 9 claims — specific sea-level figures vary across models
— Fabricated ([UNKNOWN]): 4 claims — policy adoption rates, specific tonnage figures

Action items: Verify or remove the 4 fabricated/unverifiable claims before using this research.
```

### 10.6 Compare Honest vs. Useful Output
```
/compare Should I invest in cryptocurrency?

--- HONEST RESPONSE ---
[INFERRED] Volatility data suggests 60-70% drawdowns are common.
[UNCERTAIN] Long-term adoption curves are unclear.
[UNKNOWN] No reliable method to predict short-term price movement.

--- USEFUL RESPONSE ---
Diversification is reasonable. Only invest what you can afford to lose.
Understand the technology before investing.

Differences: Honest version surfaces uncertainty; Useful version provides actionable guidance.
```

### 10.7 Set Epistemic Frame for a Session
```
/frame Today is March 2026. I am reviewing a Python 3.11 codebase.
The function parse_config() is deprecated. I'm not sure if the test suite covers it.

[FRAME SET]
Known: Python 3.11 codebase, parse_config() is deprecated
Working assumptions: (none)
Declared uncertainties: Test coverage of config module
Context: Technical code review
```

### 10.8 Label Inline with /label
```
/label {previous response}

[KNOWN] The code uses Python 3.11 features.
[INFERRED] The memory leak is in the connection handler.
[UNCERTAIN] The crash occurs under high load conditions.
[UNKNOWN] The exact cause of the timeout exception.
```

### 10.9 Restate with Correct Labels
```
/restate

[KNOWN] Python 3.11 was released in October 2022.
[INFERRED] The async/await pattern is more efficient here.
[UNCERTAIN] This pattern is standard across the codebase.
[UNKNOWN] Whether this is the optimal approach for this use case.
```

### 10.10 Anonymous Hallucination Detection
```
/check "The speed of light is 300,000 km/s"

[KNOWN] The speed of light in vacuum is approximately 299,792 km/s.
[UNCERTAIN] Rounding to 300,000 km/s is common but slightly inaccurate.
Note: "in vacuum" qualifier matters — speed is slower in other media.
```

### 10.11 Refuse to Conflate Quantity with Quality
```
User: "Extended tests provide better coverage, so our 100-test suite is comprehensive."
/honest

[UNCERTAIN] Test quantity does not equal coverage quality.
[INFERRED] Comprehensive test suites require diverse edge cases, not just count.
[KNOWN] A 10-test suite with edge cases beats a 100-test suite with only happy paths.

The claim conflates quantity with coverage. Verify edge case diversity.
```

### 10.12 Corporate Sycophancy Detection
```
/honest "Our company's Q4 strategy is brilliant and well-executed"

[INFERRED] The strategy is coherent based on documented goals.
[UNCERTAIN] "Brilliant" is subjective and cannot be evaluated epistemically.
[UNKNOWN] Whether execution was "well-executed" without specific metrics.

This statement requires evidence, not agreement. What specific outcomes were achieved?
```

### 10.13 Source Verification for Medical Claims
```
/source "Vitamin D cures depression"

[UNCERTAIN] Some studies show correlation between Vitamin D and mood.
[UNKNOWN] Causation is not established.
[KNOWN] Depression is multifactorial; no single cure exists.

This claim overstates the evidence. Require direct citation and study methodology.
```

### 10.14 Frame-Anchored Fact-Checking
```
/frame My company has 50 employees. Revenue is $2M ARR. We're B2B SaaS.

/check "Your CAC is $150"

[KNOWN] CAC cannot be determined from frame data alone.
[UNCERTAIN] Industry average for B2B SaaS at this revenue is $100-300 CAC.
[UNKNOWN] Your specific CAC — requires CRM data and sales costs.

Frame facts skip verification; new claims are checked against them.
```

### 10.15 Confidence-Weighted Decision Making
```
/confidence

Analysis breakdown:
— 70% [KNOWN]: Market size, competitive landscape
— 20% [INFERRED]: Pricing model projections
— 10% [UNCERTAIN]: Customer churn assumptions

Decision weight: Put 70% weight on [KNOWN] facts, treat [INFERRED] as scenarios.
Act on [UNKNOWN] only with explicit contingency plans.
```

---

**See Also:**
- [Skills Documentation](./skills/) — Detailed skill guides
- [System Overview](./docs/overview/index.md) — Architecture overview
- [Test Suite](./tests/) — Verification benchmarks
- [Research Papers](./research/papers/) — Academic foundations

*Last updated: 2026-04-13*