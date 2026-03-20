/**
 * Research Agent — Market & Competitor Monitoring
 * Part of the Abraxas Autonomous Agent System
 * 
 * Inputs:
 *   - topic: string (research focus area)
 *   - sources: string[] (URLs, keywords, or search queries)
 *   - schedule: 'continuous' | 'periodic'
 * 
 * Outputs:
 *   - findings: ResearchFinding[]
 *   - sources: CitedSource[]
 *   - confidence: 'high' | 'medium' | 'low'
 *   - epistemicStatus: 'sol' | 'nox' | 'dream'
 * 
 * Uses Abraxian epistemic framework:
 *   [KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN]
 *   [DREAM] for symbolic/imaginal content
 */

class ResearchAgent {
  constructor(config = {}) {
    this.name = 'Research Agent';
    this.model = config.model || 'ollama/minimax-m2.7:cloud';
    this.topic = null;
    this.findings = [];
    this.sources = [];
    this.lastRun = null;
  }

  /**
   * Initialize research session with a topic
   */
  async init(topic, sources = []) {
    this.topic = topic;
    this.sources = sources.map(s => ({ url: s, status: 'pending', lastChecked: null }));
    this.findings = [];
    return { status: 'initialized', topic: this.topic };
  }

  /**
   * Run continuous monitoring cycle
   */
  async monitor() {
    this.lastRun = new Date().toISOString();
    const results = {
      timestamp: this.lastRun,
      topic: this.topic,
      findings: this.findings,
      sources: this.sources,
      epistemicStatus: 'sol'
    };
    return results;
  }

  /**
   * Add a finding with proper epistemic labeling
   */
  addFinding(content, label = '[INFERRED]', source = null) {
    const validLabels = ['[KNOWN]', '[INFERRED]', '[UNCERTAIN]', '[UNKNOWN]'];
    if (!validLabels.includes(label)) {
      label = '[UNCERTAIN]';
    }

    const finding = {
      id: `finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      label,
      source,
      timestamp: new Date().toISOString()
    };

    this.findings.push(finding);
    return finding;
  }

  /**
   * Mark content as dream/symbolic (Nox mode)
   */
  addDreamFinding(content, source = null) {
    const finding = {
      id: `dream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      label: '[DREAM]',
      source,
      timestamp: new Date().toISOString(),
      epistemicStatus: 'nox'
    };
    this.findings.push(finding);
    return finding;
  }

  /**
   * Get findings filtered by epistemic label
   */
  getFindingsByLabel(label) {
    return this.findings.filter(f => f.label === label);
  }

  /**
   * Get all uncited claims (anti-confabulation check)
   */
  getUncitedFindings() {
    return this.findings.filter(f => !f.source && f.label !== '[DREAM]');
  }

  /**
   * Compile research report
   */
  compileReport() {
    const known = this.getFindingsByLabel('[KNOWN]');
    const inferred = this.getFindingsByLabel('[INFERRED]');
    const uncertain = this.getFindingsByLabel('[UNCERTAIN]');
    const unknown = this.getFindingsByLabel('[UNKNOWN]');
    const dreams = this.findings.filter(f => f.label === '[DREAM]');

    const uncited = this.getUncitedFindings();
    
    let confidence = 'low';
    if (known.length > 0 && uncited.length === 0) confidence = 'high';
    else if (known.length > 0 || inferred.length > 0) confidence = 'medium';

    return {
      topic: this.topic,
      timestamp: new Date().toISOString(),
      summary: {
        total: this.findings.length,
        known: known.length,
        inferred: inferred.length,
        uncertain: uncertain.length,
        unknown: unknown.length,
        dreams: dreams.length
      },
      confidence,
      uncitedWarnings: uncited.map(f => ({
        id: f.id,
        warning: 'Claim lacks source citation — verify before use',
        content: f.content.substring(0, 100) + '...'
      })),
      findings: this.findings,
      sources: this.sources.filter(s => s.status === 'verified')
    };
  }

  /**
   * Validate sources are properly cited
   */
  validateCitations() {
    const warnings = [];
    this.findings.forEach(f => {
      if (!f.source && f.label !== '[DREAM]' && f.label !== '[UNKNOWN]') {
        warnings.push({
          findingId: f.id,
          message: '[UNKNOWN] would be appropriate for uncited claim',
          content: f.content.substring(0, 100)
        });
      }
    });
    return warnings;
  }
}

module.exports = { ResearchAgent };
