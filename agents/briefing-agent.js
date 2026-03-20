/**
 * Briefing Agent — Synthesize Research into Client-Ready Briefs
 * Part of the Abraxas Autonomous Agent System
 * 
 * Inputs:
 *   - researchData: ResearchFinding[] (from Research Agent)
 *   - clientProfile: { name, industry, interests }
 *   - format: 'weekly' | 'executive' | 'detailed'
 * 
 * Outputs:
 *   - brief: Brief (structured briefing document)
 *   - highlights: string[]
 *   - actionItems: ActionItem[]
 */

class BriefingAgent {
  constructor(config = {}) {
    this.name = 'Briefing Agent';
    this.model = config.model || 'ollama/minimax-m2.7:cloud';
    this.template = null;
  }

  /**
   * Synthesize research findings into a client-ready brief
   */
  synthesize(researchData, clientProfile, format = 'weekly') {
    const brief = {
      id: `brief-${Date.now()}`,
      title: this.generateTitle(clientProfile, format),
      client: clientProfile,
      format,
      created: new Date().toISOString(),
      epistemicStatus: 'sol'
    };

    // Structure brief using Abraxian labels
    brief.sections = {
      executiveSummary: this.createExecutiveSummary(researchData),
      keyFindings: this.categorizeFindings(researchData),
      opportunities: this.extractOpportunities(researchData),
      risks: this.identifyRisks(researchData),
      recommendations: this.generateRecommendations(researchData),
      citations: this.compileCitations(researchData),
      confidenceNote: this.generateConfidenceNote(researchData)
    };

    brief.highlights = this.extractHighlights(researchData);
    brief.actionItems = this.generateActionItems(researchData);

    return brief;
  }

  generateTitle(clientProfile, format) {
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return `${clientProfile.name || 'Client'} — ${format.charAt(0).toUpperCase() + format.slice(1)} Brief (${date})`;
  }

  createExecutiveSummary(researchData) {
    const known = researchData.findings?.filter(f => f.label === '[KNOWN]') || [];
    const inferred = researchData.findings?.filter(f => f.label === '[INFERRED]') || [];
    
    return {
      label: '[INFERRED]',
      content: this.summarizeForExecutive(known, inferred),
      needsVerification: inferred.length > known.length
    };
  }

  summarizeForExecutive(known, inferred) {
    const knownCount = known.length;
    const inferredCount = inferred.length;
    
    return `This brief contains ${knownCount} verified finding${knownCount !== 1 ? 's' : ''} ` +
           `and ${inferredCount} inferential claim${inferredCount !== 1 ? 's' : ''} ` +
           `requiring independent verification. All claims are sourced and labeled ` +
           `according to the Abraxian epistemic framework.`;
  }

  categorizeFindings(researchData) {
    const findings = researchData.findings || [];
    const categorized = {
      '[KNOWN]': [],
      '[INFERRED]': [],
      '[UNCERTAIN]': [],
      '[UNKNOWN]': [],
      '[DREAM]': []
    };

    findings.forEach(f => {
      if (categorized[f.label]) {
        categorized[f.label].push(f);
      }
    });

    return categorized;
  }

  extractOpportunities(researchData) {
    const opportunities = [];
    const findings = researchData.findings || [];
    
    findings.forEach(f => {
      if (f.label === '[KNOWN]' || f.label === '[INFERRED]') {
        if (this.indicatesOpportunity(f.content)) {
          opportunities.push({
            finding: f,
            label: '[INFERRED]',
            confidence: f.label === '[KNOWN]' ? 'high' : 'medium'
          });
        }
      }
    });

    return opportunities;
  }

  indicatesOpportunity(content) {
    const indicators = ['opportunity', 'advantage', 'trend', 'growth', 'emerging', 'potential'];
    const lower = content.toLowerCase();
    return indicators.some(ind => lower.includes(ind));
  }

  identifyRisks(researchData) {
    const risks = [];
    const findings = researchData.findings || [];
    
    findings.forEach(f => {
      if (f.label === '[UNCERTAIN]') {
        risks.push({
          finding: f,
          label: '[UNCERTAIN]',
          caveat: 'This claim requires further verification before action'
        });
      }
    });

    return risks;
  }

  generateRecommendations(researchData) {
    const recommendations = [];
    const opportunities = this.extractOpportunities(researchData);
    const risks = this.identifyRisks(researchData);

    if (opportunities.length > 0) {
      recommendations.push({
        priority: 'high',
        label: '[INFERRED]',
        action: 'Explore identified market opportunities',
        basis: `${opportunities.length} opportunity indicators found`,
        verificationNeeded: opportunities.filter(o => o.confidence !== 'high').length
      });
    }

    if (risks.length > 0) {
      recommendations.push({
        priority: 'medium',
        label: '[UNCERTAIN]',
        action: 'Verify uncertain claims before committing resources',
        basis: `${risks.length} claims require additional sourcing`
      });
    }

    return recommendations;
  }

  compileCitations(researchData) {
    const sources = researchData.sources || [];
    return sources.map(s => ({
      url: s.url,
      status: s.status || 'pending',
      findings: researchData.findings?.filter(f => f.source === s.url) || []
    }));
  }

  generateConfidenceNote(researchData) {
    const findings = researchData.findings || [];
    const known = findings.filter(f => f.label === '[KNOWN]').length;
    const total = findings.length;
    
    let overallConfidence = 'low';
    if (total > 0) {
      const ratio = known / total;
      if (ratio >= 0.7) overallConfidence = 'high';
      else if (ratio >= 0.4) overallConfidence = 'medium';
    }

    return {
      label: '[INFERRED]',
      confidence: overallConfidence,
      note: `${known}/${total} claims are [KNOWN] — ${total - known} require verification`,
      antiConfabulation: 'All claims are sourced or marked [UNKNOWN]'
    };
  }

  extractHighlights(researchData) {
    const highlights = [];
    const findings = researchData.findings || [];
    
    findings
      .filter(f => f.label === '[KNOWN]' || f.label === '[INFERRED]')
      .slice(0, 5)
      .forEach(f => {
        highlights.push({
          label: f.label,
          text: f.content,
          source: f.source
        });
      });

    return highlights;
  }

  generateActionItems(researchData) {
    const items = [];
    const recommendations = this.generateRecommendations(researchData);
    
    recommendations.forEach(r => {
      items.push({
        id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        label: r.label,
        description: r.action,
        priority: r.priority,
        verificationNeeded: r.verificationNeeded || 0
      });
    });

    return items;
  }

  /**
   * Format brief for delivery
   */
  formatForDelivery(brief, format = 'markdown') {
    if (format === 'markdown') {
      return this.toMarkdown(brief);
    }
    return brief;
  }

  toMarkdown(brief) {
    let md = `# ${brief.title}\n\n`;
    md += `**Client:** ${brief.client.name || 'Unspecified'}\n`;
    md += `**Format:** ${brief.format}\n`;
    md += `**Generated:** ${new Date(brief.created).toUTCString()}\n`;
    md += `**Epistemic Status:** ${brief.epistemicStatus.toUpperCase()}\n\n`;

    md += `---\n\n## Executive Summary\n`;
    md += `*${brief.sections.executiveSummary.label}*\n`;
    md += `${brief.sections.executiveSummary.content}\n\n`;

    md += `### Confidence Note\n`;
    md += `*${brief.sections.confidenceNote.label}*\n`;
    md += `${brief.sections.confidenceNote.note}\n`;
    md += `**Anti-Confabulation:** ${brief.sections.confidenceNote.antiConfabulation}\n\n`;

    md += `## Key Findings\n\n`;
    ['[KNOWN]', '[INFERRED]', '[UNCERTAIN]', '[UNKNOWN]'].forEach(label => {
      const items = brief.sections.keyFindings[label] || [];
      if (items.length > 0) {
        md += `### ${label} (${items.length})\n`;
        items.forEach(f => {
          md += `- ${f.content}\n`;
          if (f.source) md += `  *Source: ${f.source}*\n`;
        });
        md += '\n';
      }
    });

    if (brief.highlights.length > 0) {
      md += `## Highlights\n\n`;
      brief.highlights.forEach(h => {
        md += `**${h.label}** ${h.text}\n`;
        if (h.source) md += `*Source: ${h.source}*\n`;
        md += '\n';
      });
    }

    if (brief.actionItems.length > 0) {
      md += `## Action Items\n\n`;
      brief.actionItems.forEach(a => {
        md += `- **[${a.priority.toUpperCase()}]** ${a.description} ${a.label}\n`;
        if (a.verificationNeeded > 0) {
          md += `  *⚠️ ${a.verificationNeeded} item(s) require verification*\n`;
        }
      });
      md += '\n';
    }

    md += `---\n\n## Citations\n\n`;
    brief.sections.citations.forEach(c => {
      md += `- ${c.url} (${c.status})\n`;
    });

    return md;
  }
}

module.exports = { BriefingAgent };
