/**
 * Delivery Agent — Format and Deliver Weekly Briefs
 * Part of the Abraxas Autonomous Agent System
 * 
 * Inputs:
 *   - brief: Brief (from Briefing Agent)
 *   - deliveryMethod: 'email' | 'api' | 'dashboard' | 'all'
 *   - schedule: CronExpression
 * 
 * Outputs:
 *   - deliveryRecord: DeliveryRecord
 *   - deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed'
 *   - receipts: Receipt[]
 */

class DeliveryAgent {
  constructor(config = {}) {
    this.name = 'Delivery Agent';
    this.model = config.model || 'ollama/minimax-m2.7:cloud';
    this.deliveryHistory = [];
    this.scheduledDeliveries = [];
  }

  /**
   * Prepare brief for delivery (format, validate, attach metadata)
   */
  prepareBrief(brief, options = {}) {
    const prepared = {
      id: `prepared-${Date.now()}`,
      originalBrief: brief,
      formats: this.prepareFormats(brief, options.formats || ['markdown', 'json']),
      metadata: {
        prepared: new Date().toISOString(),
        epistemicStatus: brief.epistemicStatus,
        confidenceLevel: brief.sections?.confidenceNote?.confidence,
        clientId: brief.client?.id,
        clientName: brief.client?.name,
        format: brief.format
      },
      validation: this.validateBrief(brief),
      status: 'prepared'
    };

    return prepared;
  }

  prepareFormats(brief, formats) {
    const prepared = {};
    
    formats.forEach(format => {
      switch (format) {
        case 'markdown':
          prepared.markdown = this.toMarkdown(brief);
          break;
        case 'json':
          prepared.json = JSON.stringify(brief, null, 2);
          break;
        case 'html':
          prepared.html = this.toHTML(brief);
          break;
        case 'pdf':
          prepared.pdf = this.toPDFConfig(brief);
          break;
      }
    });

    return prepared;
  }

  toMarkdown(brief) {
    const { BriefingAgent } = require('./briefing-agent');
    const briefing = new BriefingAgent();
    return briefing.formatForDelivery(brief, 'markdown');
  }

  toHTML(brief) {
    const md = this.toMarkdown(brief);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${brief.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
           max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { border-bottom: 2px solid #333; }
    h2 { margin-top: 30px; }
    .label { display: inline-block; padding: 2px 8px; border-radius: 3px; 
              font-size: 0.85em; font-weight: bold; }
    .KNOWN { background: #d4edda; color: #155724; }
    .INFERRED { background: #fff3cd; color: #856404; }
    .UNCERTAIN { background: #f8d7da; color: #721c24; }
    .UNKNOWN { background: #e2e3e5; color: #383d41; }
    .DREAM { background: #d6daf8; color: #1a1a6e; }
    .confidence { background: #f0f0f0; padding: 10px; border-radius: 5px; margin: 20px 0; }
    hr { margin: 30px 0; }
  </style>
</head>
<body>
${md.replace(/^# (.+)$/gm, '<h1>$1</h1>')
   .replace(/^## (.+)$/gm, '<h2>$1</h2>')
   .replace(/^### (.+)$/gm, '<h3>$1</h3>')
   .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
   .replace(/^- (.+)$/gm, '<li>$1</li>')
   .replace(/\[([A-Z]+)\]/g, '<span class="label $1">[$1]</span>')}
</body>
</html>`;
  }

  toPDFConfig(brief) {
    return {
      content: this.toHTML(brief),
      options: {
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
      }
    };
  }

  validateBrief(brief) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!brief.id) {
      validation.errors.push('Brief missing ID');
      validation.isValid = false;
    }

    if (!brief.client?.name) {
      validation.warnings.push('Client name not specified');
    }

    if (!brief.sections?.confidenceNote) {
      validation.warnings.push('Confidence note not generated');
    }

    const findings = brief.sections?.keyFindings || {};
    const uncited = (findings['[INFERRED]'] || []).length;
    if (uncited > 0) {
      validation.warnings.push(`${uncited} inferential claims need verification`);
    }

    return validation;
  }

  /**
   * Schedule delivery for a specific time
   */
  scheduleDelivery(preparedBrief, schedule, deliveryMethod = 'email') {
    const scheduled = {
      id: `schedule-${Date.now()}`,
      preparedBrief,
      schedule,
      deliveryMethod,
      status: 'scheduled',
      created: new Date().toISOString(),
      executeAt: this.parseSchedule(schedule)
    };

    this.scheduledDeliveries.push(scheduled);
    return scheduled;
  }

  parseSchedule(schedule) {
    // Simple cron-like parsing
    if (typeof schedule === 'string') {
      const parts = schedule.split(' ');
      if (parts.length >= 5) {
        const now = new Date();
        // Simplified - just return next occurrence
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      }
    }
    return new Date().toISOString();
  }

  /**
   * Execute delivery to specified channel
   */
  async deliver(preparedBrief, deliveryMethod = 'email') {
    const record = {
      id: `delivery-${Date.now()}`,
      preparedBriefId: preparedBrief.id,
      deliveryMethod,
      status: 'pending',
      created: new Date().toISOString(),
      attempts: []
    };

    try {
      switch (deliveryMethod) {
        case 'email':
          await this.sendEmail(preparedBrief);
          break;
        case 'api':
          await this.sendToAPI(preparedBrief);
          break;
        case 'dashboard':
          await this.updateDashboard(preparedBrief);
          break;
        case 'all':
          await Promise.all([
            this.sendEmail(preparedBrief),
            this.sendToAPI(preparedBrief),
            this.updateDashboard(preparedBrief)
          ]);
          break;
      }

      record.status = 'sent';
      record.sentAt = new Date().toISOString();
    } catch (error) {
      record.status = 'failed';
      record.error = error.message;
    }

    this.deliveryHistory.push(record);
    return record;
  }

  async sendEmail(preparedBrief) {
    // Placeholder for email integration
    const emailRecord = {
      to: preparedBrief.metadata.clientName || 'client@example.com',
      subject: preparedBrief.originalBrief.title,
      body: preparedBrief.formats.markdown || preparedBrief.formats.json,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    return emailRecord;
  }

  async sendToAPI(preparedBrief) {
    // Placeholder for API integration
    const apiRecord = {
      endpoint: 'https://api.example.com/briefs',
      payload: preparedBrief.formats.json,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    return apiRecord;
  }

  async updateDashboard(preparedBrief) {
    // Placeholder for dashboard update
    const dashboardRecord = {
      dashboardId: 'main',
      briefId: preparedBrief.originalBrief.id,
      updatedAt: new Date().toISOString(),
      status: 'updated'
    };
    return dashboardRecord;
  }

  /**
   * Get delivery status and history
   */
  getStatus() {
    return {
      totalDeliveries: this.deliveryHistory.length,
      byStatus: {
        pending: this.deliveryHistory.filter(d => d.status === 'pending').length,
        sent: this.deliveryHistory.filter(d => d.status === 'sent').length,
        failed: this.deliveryHistory.filter(d => d.status === 'failed').length
      },
      scheduled: this.scheduledDeliveries.length,
      recent: this.deliveryHistory.slice(-5)
    };
  }

  /**
   * Retry failed delivery
   */
  retryDelivery(deliveryId) {
    const record = this.deliveryHistory.find(d => d.id === deliveryId);
    if (record && record.status === 'failed') {
      record.status = 'pending';
      record.attempts.push({
        attemptedAt: new Date().toISOString(),
        previousError: record.error
      });
      return { status: 'retry_scheduled', deliveryId };
    }
    return { status: 'not_found_or_not_failed' };
  }
}

module.exports = { DeliveryAgent };
