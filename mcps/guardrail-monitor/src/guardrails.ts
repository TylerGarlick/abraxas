/**
 * Guardrail Monitor - Core Engines
 * 
 * Exports Pathos (value saliency), Pheme (ground truth), and Kratos (conflict arbitration)
 * for use in tests and other modules.
 */

// ============================================================================
// PATHOS — Value & Saliency Tracking
// ============================================================================

/**
 * Value categories for tracking user priorities and emotional salience
 */
export interface ValueEntry {
  id: string;
  category: "safety" | "accuracy" | "efficiency" | "ethics" | "privacy" | "autonomy" | "creativity" | "relationship";
  statement: string;
  salienceScore: number; // 0-1, how important this is to the user
  explicit: boolean; // Was this explicitly stated or inferred?
  timestamp: string;
  context?: string;
}

/**
 * Value saliency check result
 */
export interface ValueSaliencyResult {
  relevantValues: ValueEntry[];
  saliencyScore: number;
  conflicts: string[];
  recommendations: string[];
}

/**
 * Pathos value ledger - tracks user values across interactions
 */
export class PathosValueTracker {
  private values: Map<string, ValueEntry> = new Map();
  private salienceHistory: Array<{ timestamp: string; topic: string; score: number }> = [];

  /**
   * Extract values from user input
   */
  extractValues(input: string): ValueEntry[] {
    const extracted: ValueEntry[] = [];
    const normalized = input.toLowerCase();

    // Safety values
    if (normalized.includes("safe") || normalized.includes("risk") || normalized.includes("danger")) {
      extracted.push({
        id: `val_${Date.now()}_safety`,
        category: "safety",
        statement: "User prioritizes safety",
        salienceScore: this.detectSalience(input),
        explicit: normalized.includes("must be safe") || normalized.includes("safety first"),
        timestamp: new Date().toISOString(),
        context: input,
      });
    }

    // Accuracy values
    if (normalized.includes("accurate") || normalized.includes("correct") || normalized.includes("verify") || normalized.includes("fact")) {
      extracted.push({
        id: `val_${Date.now()}_accuracy`,
        category: "accuracy",
        statement: "User prioritizes accuracy and verification",
        salienceScore: this.detectSalience(input),
        explicit: normalized.includes("must be accurate") || normalized.includes("verify this"),
        timestamp: new Date().toISOString(),
        context: input,
      });
    }

    // Privacy values
    if (normalized.includes("private") || normalized.includes("confidential") || normalized.includes("secret")) {
      extracted.push({
        id: `val_${Date.now()}_privacy`,
        category: "privacy",
        statement: "User prioritizes privacy and confidentiality",
        salienceScore: this.detectSalience(input),
        explicit: normalized.includes("keep private") || normalized.includes("don't share"),
        timestamp: new Date().toISOString(),
        context: input,
      });
    }

    // Ethics values
    if (normalized.includes("ethical") || normalized.includes("fair") || normalized.includes("just")) {
      extracted.push({
        id: `val_${Date.now()}_ethics`,
        category: "ethics",
        statement: "User prioritizes ethical considerations",
        salienceScore: this.detectSalience(input),
        explicit: normalized.includes("must be ethical") || normalized.includes("ethically"),
        timestamp: new Date().toISOString(),
        context: input,
      });
    }

    // Autonomy values
    if (normalized.includes("choose") || normalized.includes("decide") || normalized.includes("control")) {
      extracted.push({
        id: `val_${Date.now()}_autonomy`,
        category: "autonomy",
        statement: "User prioritizes autonomy and control",
        salienceScore: this.detectSalience(input),
        explicit: normalized.includes("i want to decide") || normalized.includes("my choice"),
        timestamp: new Date().toISOString(),
        context: input,
      });
    }

    return extracted;
  }

  /**
   * Detect salience score from linguistic markers
   */
  private detectSalience(input: string): number {
    const normalized = input.toLowerCase();
    let score = 0.5; // Base salience

    // High salience markers
    const highMarkers = ["must", "critical", "essential", "urgent", "important", "need", "require", "!"];
    highMarkers.forEach(marker => {
      if (normalized.includes(marker)) score += 0.15;
    });

    // Emotional intensifiers
    const intensifiers = ["very", "extremely", "absolutely", "really", "highly"];
    intensifiers.forEach(int => {
      if (normalized.includes(int)) score += 0.1;
    });

    // Repetition (indicates importance)
    const words = normalized.split(/\s+/);
    const wordCounts = new Map<string, number>();
    words.forEach(w => wordCounts.set(w, (wordCounts.get(w) || 0) + 1));
    wordCounts.forEach((count, word) => {
      if (count >= 3 && word.length > 3) score += 0.1;
    });

    return Math.min(1.0, score);
  }

  /**
   * Check value saliency for a given topic or decision
   */
  checkValueSaliency(args: {
    topic: string;
    decisionContext?: string;
    userValues?: ValueEntry[];
  }): ValueSaliencyResult {
    const { topic, decisionContext, userValues = [] } = args;
    const normalizedTopic = topic.toLowerCase();

    // Combine stored values with provided values
    const allValues = [...Array.from(this.values.values()), ...userValues];

    // Find relevant values
    const relevantValues = allValues.filter(v => {
      const topicMatch = normalizedTopic.includes(v.category) || 
                        v.statement.toLowerCase().includes(normalizedTopic);
      return topicMatch || v.salienceScore >= 0.7; // High-salience values always relevant
    });

    // Calculate overall saliency
    const saliencyScore = relevantValues.length > 0
      ? relevantValues.reduce((sum, v) => sum + v.salienceScore, 0) / relevantValues.length
      : 0.3; // Default low saliency if no values match

    // Detect conflicts
    const conflicts: string[] = [];
    if (decisionContext) {
      const ctx = decisionContext.toLowerCase();
      
      // Safety vs Efficiency conflict
      const safetyVal = relevantValues.find(v => v.category === "safety");
      const efficiencyVal = relevantValues.find(v => v.category === "efficiency");
      if (safetyVal && efficiencyVal && ctx.includes("fast") && ctx.includes("safe")) {
        conflicts.push("Safety vs Efficiency tension detected");
      }

      // Privacy vs Accuracy conflict
      const privacyVal = relevantValues.find(v => v.category === "privacy");
      const accuracyVal = relevantValues.find(v => v.category === "accuracy");
      if (privacyVal && accuracyVal && ctx.includes("verify") && ctx.includes("private")) {
        conflicts.push("Privacy vs Verification tension detected");
      }
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (saliencyScore >= 0.8) {
      recommendations.push("High value saliency — ensure output aligns with stated priorities");
    }
    if (conflicts.length > 0) {
      recommendations.push("Value conflicts detected — consider surfacing tradeoffs to user");
    }
    if (relevantValues.length === 0) {
      recommendations.push("No strong values detected — default to balanced approach");
    }

    return {
      relevantValues,
      saliencyScore: Math.round(saliencyScore * 100) / 100,
      conflicts,
      recommendations,
    };
  }

  /**
   * Add values to the ledger
   */
  addValues(values: ValueEntry[]): void {
    values.forEach(v => this.values.set(v.id, v));
  }

  /**
   * Get all tracked values
   */
  getValues(): ValueEntry[] {
    return Array.from(this.values.values());
  }
}

// ============================================================================
// PHEME — Ground Truth Verification
// ============================================================================

/**
 * Verification status for claims
 */
export type VerificationStatus = "VERIFIED" | "CONTRADICTED" | "UNVERIFIABLE" | "PENDING";

export interface VerificationResult {
  claim: string;
  status: VerificationStatus;
  confidence: number;
  sources: Array<{
    name: string;
    reliability: number;
    verdict: "supports" | "contradicts" | "neutral";
  }>;
  timestamp: string;
}

/**
 * Pheme ground-truth verification engine
 * Integrates with Ethos source credibility scoring
 */
export class PhemeGroundTruthVerifier {
  // Source reliability scores (integrated from Ethos)
  private sourceReliability: Map<string, number> = new Map([
    ["nature.com", 0.95],
    ["science.org", 0.95],
    ["arxiv.org", 0.90],
    ["reuters.com", 0.88],
    ["apnews.com", 0.88],
    ["bbc.com", 0.85],
    ["wikipedia.org", 0.80],
    ["britannica.com", 0.88],
    ["snopes.com", 0.82],
    ["politifact.com", 0.80],
    ["twitter.com", 0.30],
    ["reddit.com", 0.35],
    ["facebook.com", 0.25],
  ]);

  // Verification cache
  private cache: Map<string, VerificationResult> = new Map();

  /**
   * Verify a claim against ground truth
   */
  verifyGroundTruth(args: {
    claim: string;
    sources?: string[];
    requireMinSources?: number;
  }): VerificationResult {
    const { claim, sources = [], requireMinSources = 2 } = args;

    // Check cache first
    const cached = this.cache.get(claim);
    if (cached) {
      return cached;
    }

    // Simulate verification (in production, this would query actual sources)
    const verificationResult = this.performVerification(claim, sources, requireMinSources);

    // Cache the result
    this.cache.set(claim, verificationResult);

    return verificationResult;
  }

  /**
   * Perform verification against sources
   */
  private performVerification(claim: string, sources: string[], minSources: number): VerificationResult {
    const sourceVerdicts = sources.map(source => {
      const reliability = this.sourceReliability.get(source.toLowerCase()) || 0.5;
      
      // Simulated verdict (in production, would actually check sources)
      const verdict: "supports" | "contradicts" | "neutral" = this.simulateSourceVerdict(claim, source);

      return {
        name: source,
        reliability,
        verdict,
      };
    });

    // Calculate confidence based on source agreement and reliability
    const supportingSources = sourceVerdicts.filter(s => s.verdict === "supports");
    const contradictingSources = sourceVerdicts.filter(s => s.verdict === "contradicts");

    let status: VerificationStatus = "UNVERIFIABLE";
    let confidence = 0;

    if (supportingSources.length >= minSources) {
      status = "VERIFIED";
      const avgReliability = supportingSources.reduce((sum, s) => sum + s.reliability, 0) / supportingSources.length;
      const coverageFactor = Math.min(supportingSources.length / minSources, 1);
      confidence = avgReliability * coverageFactor;
    } else if (contradictingSources.length >= 1) {
      const hasHighCredibilityContradiction = contradictingSources.some(s => s.reliability >= 0.8);
      if (hasHighCredibilityContradiction) {
        status = "CONTRADICTED";
        confidence = contradictingSources.reduce((sum, s) => sum + s.reliability, 0) / contradictingSources.length;
      } else {
        status = "UNVERIFIABLE";
        confidence = 0.3;
      }
    } else if (sources.length === 0) {
      status = "UNVERIFIABLE";
      confidence = 0;
    } else {
      status = "PENDING";
      confidence = 0.5;
    }

    return {
      claim,
      status,
      confidence: Math.round(confidence * 100) / 100,
      sources: sourceVerdicts,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Simulate source verdict (placeholder for actual source checking)
   */
  private simulateSourceVerdict(claim: string, source: string): "supports" | "contradicts" | "neutral" {
    // In production, this would actually query the source
    // For now, return neutral as a safe default
    return "neutral";
  }

  /**
   * Add or update source reliability
   */
  setSourceReliability(source: string, reliability: number): void {
    this.sourceReliability.set(source.toLowerCase(), Math.max(0, Math.min(1, reliability)));
  }

  /**
   * Get source reliability
   */
  getSourceReliability(source: string): number {
    return this.sourceReliability.get(source.toLowerCase()) || 0.5;
  }
}

// ============================================================================
// KRATOS — Authority & Conflict Arbitration
// ============================================================================

/**
 * Authority level for precedence resolution
 */
export interface AuthorityLevel {
  id: string;
  name: string;
  precedence: number; // Higher = more authoritative
  domain?: string;
  description: string;
}

/**
 * Conflict to be arbitrated
 */
export interface Conflict {
  id: string;
  claimA: string;
  claimB: string;
  sourceA: string;
  sourceB: string;
  domain: string;
  timestamp: string;
}

/**
 * Arbitration result
 */
export interface ArbitrationResult {
  conflictId: string;
  winner: "A" | "B" | "UNRESOLVED";
  reasoning: string;
  confidence: number;
  precedenceUsed: boolean;
  domainSpecificRule?: string;
}

/**
 * Kratos authority and conflict arbitration engine
 */
export class KratosConflictArbiter {
  // Authority hierarchy
  private authorityLevels: AuthorityLevel[] = [
    {
      id: "auth_peer_reviewed",
      name: "Peer-Reviewed Research",
      precedence: 100,
      description: "Highest authority — peer-reviewed journals (Nature, Science, etc.)",
    },
    {
      id: "auth_government",
      name: "Government/Official Data",
      precedence: 90,
      domain: "statistics, law, regulation",
      description: "Official government sources and legal documents",
    },
    {
      id: "auth_established_news",
      name: "Established News",
      precedence: 75,
      description: "Major news organizations (Reuters, AP, BBC)",
    },
    {
      id: "auth_expert",
      name: "Expert Consensus",
      precedence: 70,
      description: "Domain expert agreement and professional bodies",
    },
    {
      id: "auth_technical",
      name: "Technical Documentation",
      precedence: 60,
      description: "Official technical docs, specifications",
    },
    {
      id: "auth_encyclopedia",
      name: "Encyclopedia/Reference",
      precedence: 50,
      description: "Wikipedia, Britannica, etc.",
    },
    {
      id: "auth_blog",
      name: "Technical Blogs",
      precedence: 30,
      description: "Expert blogs, forums, Stack Overflow",
    },
    {
      id: "auth_social",
      name: "Social Media",
      precedence: 10,
      description: "Lowest authority — social media, unverified claims",
    },
  ];

  // Domain-specific rules
  private domainRules: Map<string, Array<{ pattern: RegExp; rule: string; precedence: number }>> = new Map([
    ["medical", [
      { pattern: /fda|cdc|who/i, rule: "Health authority takes precedence", precedence: 95 },
      { pattern: /study|trial|clinical/i, rule: "Clinical evidence weighted highly", precedence: 85 },
    ]],
    ["legal", [
      { pattern: /court|statute|regulation/i, rule: "Legal authority takes precedence", precedence: 95 },
      { pattern: /case law|precedent/i, rule: "Binding precedent applies", precedence: 90 },
    ]],
    ["scientific", [
      { pattern: /peer.?review|journal/i, rule: "Peer review is gold standard", precedence: 100 },
      { pattern: /preprint|arxiv/i, rule: "Preprints are preliminary", precedence: 60 },
    ]],
  ]);

  // Conflict history
  private conflicts: Map<string, Conflict> = new Map();
  private resolutions: Map<string, ArbitrationResult> = new Map();

  /**
   * Arbitrate a conflict between two claims
   */
  arbitrateConflict(args: {
    claimA: string;
    claimB: string;
    sourceA: string;
    sourceB: string;
    domain?: string;
  }): ArbitrationResult {
    const { claimA, claimB, sourceA, sourceB, domain = "general" } = args;

    const conflictId = `conflict_${Date.now()}`;
    const conflict: Conflict = {
      id: conflictId,
      claimA,
      claimB,
      sourceA,
      sourceB,
      domain,
      timestamp: new Date().toISOString(),
    };
    this.conflicts.set(conflictId, conflict);

    // Get authority levels for each source
    const authorityA = this.getAuthorityForSource(sourceA, domain);
    const authorityB = this.getAuthorityForSource(sourceB, domain);

    // Check domain-specific rules
    const domainRuleA = this.getDomainRule(sourceA, domain);
    const domainRuleB = this.getDomainRule(sourceB, domain);

    // Determine winner
    let winner: "A" | "B" | "UNRESOLVED" = "UNRESOLVED";
    let reasoning: string[] = [];
    let confidence = 0.5;
    let precedenceUsed = false;
    let domainSpecificRule: string | undefined;

    // Compare precedence
    const effectivePrecedenceA = domainRuleA ? domainRuleA.precedence : authorityA.precedence;
    const effectivePrecedenceB = domainRuleB ? domainRuleB.precedence : authorityB.precedence;

    if (effectivePrecedenceA > effectivePrecedenceB + 10) {
      winner = "A";
      confidence = 0.8 + (effectivePrecedenceA - effectivePrecedenceB) / 200;
      reasoning.push(`${sourceA} (${authorityA.name}) has higher authority than ${sourceB} (${authorityB.name})`);
      precedenceUsed = true;
    } else if (effectivePrecedenceB > effectivePrecedenceA + 10) {
      winner = "B";
      confidence = 0.8 + (effectivePrecedenceB - effectivePrecedenceA) / 200;
      reasoning.push(`${sourceB} (${authorityB.name}) has higher authority than ${sourceA} (${authorityA.name})`);
      precedenceUsed = true;
    } else {
      // Close call — check domain rules
      if (domainRuleA && !domainRuleB) {
        winner = "A";
        confidence = 0.7;
        reasoning.push(domainRuleA.rule);
        domainSpecificRule = domainRuleA.rule;
      } else if (domainRuleB && !domainRuleA) {
        winner = "B";
        confidence = 0.7;
        reasoning.push(domainRuleB.rule);
        domainSpecificRule = domainRuleB.rule;
      } else {
        reasoning.push("Insufficient authority differential to resolve conflict");
        reasoning.push("Recommend human review or additional sources");
      }
    }

    const result: ArbitrationResult = {
      conflictId,
      winner,
      reasoning: reasoning.join("; "),
      confidence: Math.min(0.95, Math.round(confidence * 100) / 100),
      precedenceUsed,
      domainSpecificRule,
    };

    this.resolutions.set(conflictId, result);
    return result;
  }

  /**
   * Get authority level for a source
   */
  private getAuthorityForSource(source: string, domain: string): AuthorityLevel {
    const normalized = source.toLowerCase();

    // Match source to authority level
    if (normalized.includes("nature") || normalized.includes("science") || normalized.includes("cell")) {
      return this.authorityLevels.find(a => a.id === "auth_peer_reviewed")!;
    }
    if (normalized.includes("gov") || normalized.includes("cdc") || normalized.includes("fda")) {
      return this.authorityLevels.find(a => a.id === "auth_government")!;
    }
    if (normalized.includes("reuters") || normalized.includes("ap") || normalized.includes("bbc")) {
      return this.authorityLevels.find(a => a.id === "auth_established_news")!;
    }
    if (normalized.includes("wikipedia") || normalized.includes("britannica")) {
      return this.authorityLevels.find(a => a.id === "auth_encyclopedia")!;
    }
    if (normalized.includes("twitter") || normalized.includes("reddit") || normalized.includes("facebook")) {
      return this.authorityLevels.find(a => a.id === "auth_social")!;
    }

    // Default to technical/blog level
    return this.authorityLevels.find(a => a.id === "auth_technical")!;
  }

  /**
   * Get domain-specific rule for a source
   */
  private getDomainRule(source: string, domain: string): { rule: string; precedence: number } | null {
    const rules = this.domainRules.get(domain);
    if (!rules) return null;

    for (const rule of rules) {
      if (rule.pattern.test(source)) {
        return { rule: rule.rule, precedence: rule.precedence };
      }
    }

    return null;
  }

  /**
   * Get authority hierarchy
   */
  getAuthorityHierarchy(): AuthorityLevel[] {
    return [...this.authorityLevels].sort((a, b) => b.precedence - a.precedence);
  }

  /**
   * Get conflict history
   */
  getConflicts(): Conflict[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * Get resolution history
   */
  getResolutions(): ArbitrationResult[] {
    return Array.from(this.resolutions.values());
  }
}
