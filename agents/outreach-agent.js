/**
 * Outreach Agent — LinkedIn/Email Prospecting to Clients
 * Part of the Abraxas Autonomous Agent System
 * 
 * Inputs:
 *   - prospects: Prospect[]
 *   - brief: Brief (from Briefing Agent)
 *   - channel: 'linkedin' | 'email' | 'both'
 * 
 * Outputs:
 *   - outreach: OutreachAttempt[]
 *   - responses: Response[]
 *   - conversionMetrics: ConversionMetrics
 * 
 * Uses Abraxian epistemic framework for honest messaging
 */

class OutreachAgent {
  constructor(config = {}) {
    this.name = 'Outreach Agent';
    this.model = config.model || 'ollama/minimax-m2.7:cloud';
    this.prospects = [];
    this.outreachHistory = [];
  }

  /**
   * Load prospects for outreach campaign
   */
  loadProspects(prospects) {
    this.prospects = prospects.map(p => ({
      ...p,
      id: p.id || `prospect-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      status: 'loaded',
      loadedAt: new Date().toISOString()
    }));
    return { loaded: this.prospects.length };
  }

  /**
   * Generate personalized outreach message using brief content
   */
  generateMessage(prospect, brief, channel = 'email') {
    const template = channel === 'linkedin' 
      ? this.getLinkedInTemplate() 
      : this.getEmailTemplate();

    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      prospectId: prospect.id,
      channel,
      subject: this.generateSubject(prospect, brief, channel),
      body: this.interpolateTemplate(template, prospect, brief),
      epistemicStatus: 'sol',
      created: new Date().toISOString(),
      sent: false,
      responses: []
    };

    // Apply Abraxian honesty principle — no overpromising
    const hasUncertainties = brief.sections?.confidenceNote?.confidence !== 'high';
    if (hasUncertainties) {
      message.disclaimer = `[UNCERTAIN] This brief contains claims requiring verification. ` +
        `Outreach messaging should acknowledge this uncertainty.`;
      message.body += `\n\n---\n*This message references research findings that are still being verified. ` +
        `We value accuracy over persuasion.*`;
    }

    return message;
  }

  getEmailTemplate() {
    return {
      subject: 'Intelligence Brief: {{topic}}',
      body: `{{greeting}},

{{personalization}}

I've compiled a brief on {{topic}} that may be relevant to {{companyName}}.

{{highlights}}

{{callToAction}}

{{disclaimer}}

Best regards`
    };
  }

  getLinkedInTemplate() {
    return {
      subject: '{{firstName}} — Brief on {{topic}}',
      body: `Hi {{firstName}},

{{personalization}}

Thought you'd find this relevant — I recently completed research on {{topic}}.

{{highlights}}

{{callToAction}}

{{disclaimer}}`
    };
  }

  generateSubject(prospect, brief, channel) {
    const topic = brief.topic || 'market intelligence';
    const company = prospect.companyName || 'your industry';
    
    if (channel === 'linkedin') {
      return `Brief on ${topic} — ${company}`;
    }
    return `Intelligence Brief: ${topic} (${company})`;
  }

  interpolateTemplate(template, prospect, brief) {
    let body = template.body;
    
    // Handle personalization
    body = body.replace('{{greeting}}', `Dear ${prospect.firstName || prospect.name || 'there'},`);
    body = body.replace('{{firstName}}', prospect.firstName || prospect.name || 'there');
    body = body.replace('{{companyName}}', prospect.companyName || 'your company');
    body = body.replace('{{topic}}', brief.topic || 'market intelligence');

    // Generate highlights from brief
    const highlights = brief.highlights || [];
    if (highlights.length > 0) {
      const highlightText = highlights
        .slice(0, 3)
        .map(h => `- ${h.text}`)
        .join('\n');
      body = body.replace('{{highlights}}', `**Key Findings:**\n${highlightText}`);
    } else {
      body = body.replace('{{highlights}}', '*See attached brief for detailed findings.*');
    }

    // Generate personalization
    const personalization = this.generatePersonalization(prospect, brief);
    body = body.replace('{{personalization}}', personalization);

    // Call to action
    body = body.replace('{{callToAction}}', this.generateCTA(prospect, brief));

    // Disclaimer
    body = body.replace('{{disclaimer}}', '');

    return body;
  }

  generatePersonalization(prospect, brief) {
    const elements = [];
    
    if (prospect.role) {
      elements.push(`As someone in ${prospect.role} at ${prospect.companyName || 'your organization'}`);
    }
    
    if (prospect.interests && Array.isArray(prospect.interests)) {
      const relevant = prospect.interests.filter(i => 
        brief.topic?.toLowerCase().includes(i.toLowerCase())
      );
      if (relevant.length > 0) {
        elements.push(`given your interest in ${relevant.join(', ')}`);
      }
    }

    return elements.length > 0 ? elements.join(', ') + ',...' : 'I wanted to share some research that might interest you.';
  }

  generateCTA(prospect, brief) {
    return `I'd be happy to share the full brief if you'd find it valuable. ` +
      `Would you be open to a brief call this week?\n\n` +
      `[UNCERTAIN] Response timing may vary based on your availability.`;
  }

  /**
   * Send outreach to multiple prospects
   */
  async sendOutreach(prospects, brief, channel = 'email') {
    const results = {
      attempted: 0,
      successful: 0,
      failed: 0,
      messages: [],
      errors: []
    };

    for (const prospect of prospects) {
      try {
        const message = this.generateMessage(prospect, brief, channel);
        
        // In production, this would integrate with email/LinkedIn API
        // For now, mark as queued
        message.status = 'queued';
        message.prospect = {
          name: prospect.name,
          email: prospect.email,
          companyName: prospect.companyName
        };

        results.messages.push(message);
        results.attempted++;
        results.successful++;

        this.outreachHistory.push({
          prospectId: prospect.id,
          messageId: message.id,
          channel,
          timestamp: message.created,
          status: 'sent'
        });
      } catch (error) {
        results.failed++;
        results.errors.push({
          prospectId: prospect.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Track response to outreach
   */
  trackResponse(messageId, response) {
    const message = this.outreachHistory.find(h => h.messageId === messageId);
    if (message) {
      message.response = {
        type: response.type || 'reply',
        content: response.content,
        timestamp: new Date().toISOString(),
        epistemicStatus: 'sol'
      };
      message.status = response.type === 'positive' ? 'converted' : 'responded';
    }
    return message;
  }

  /**
   * Get conversion metrics
   */
  getMetrics() {
    const total = this.outreachHistory.length;
    const sent = this.outreachHistory.filter(h => h.status === 'sent' || h.status === 'converted').length;
    const responded = this.outreachHistory.filter(h => h.response).length;
    const converted = this.outreachHistory.filter(h => h.status === 'converted').length;

    return {
      totalOutreach: total,
      sent,
      responded,
      converted,
      responseRate: total > 0 ? (responded / total * 100).toFixed(1) + '%' : 'N/A',
      conversionRate: sent > 0 ? (converted / sent * 100).toFixed(1) + '%' : 'N/A',
      epistemicCompliance: this.checkEpistemicCompliance()
    };
  }

  checkEpistemicCompliance() {
    const messagesWithDisclaimer = this.outreachHistory.filter(h => 
      h.message?.disclaimer?.includes('[UNCERTAIN]')
    ).length;
    
    return {
      messagesWithUncertaintyDisclaimer: messagesWithDisclaimer,
      compliant: messagesWithDisclaimer === this.outreachHistory.length,
      note: 'All outreach should acknowledge research limitations'
    };
  }

  /**
   * Generate outreach report
   */
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      recentOutreach: this.outreachHistory.slice(-10),
      prospectStatus: this.prospects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        lastContacted: this.outreachHistory
          .filter(h => h.prospectId === p.id)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]?.timestamp
      }))
    };
  }
}

module.exports = { OutreachAgent };
