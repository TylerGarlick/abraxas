/**
 * Feedback Agent — Collect and Act on Client Feedback
 * Part of the Abraxas Autonomous Agent System
 * 
 * Inputs:
 *   - feedback: FeedbackItem[]
 *   - clientId: string
 * 
 * Outputs:
 *   - feedbackAnalysis: FeedbackAnalysis
 *   - actionItems: ActionItem[]
 *   - satisfactionScore: number (0-100)
 */

class FeedbackAgent {
  constructor(config = {}) {
    this.name = 'Feedback Agent';
    this.model = config.model || 'ollama/minimax-m2.7:cloud';
    this.feedbackHistory = [];
    this.feedbackByClient = new Map();
  }

  /**
   * Collect feedback from a client
   */
  collect(feedbackItem) {
    const feedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ...feedbackItem,
      received: new Date().toISOString(),
      epistemicStatus: 'sol',
      labels: this.analyzeFeedbackLabels(feedbackItem)
    };

    this.feedbackHistory.push(feedback);
    
    if (feedbackItem.clientId) {
      const clientFeedback = this.feedbackByClient.get(feedbackItem.clientId) || [];
      clientFeedback.push(feedback);
      this.feedbackByClient.set(feedbackItem.clientId, clientFeedback);
    }

    return feedback;
  }

  analyzeFeedbackLabels(feedbackItem) {
    const labels = [];
    const content = (feedbackItem.content || '').toLowerCase();
    
    // Sentiment analysis using keywords
    if (['excellent', 'amazing', 'love', 'perfect', 'outstanding'].some(w => content.includes(w))) {
      labels.push({ label: '[POSITIVE]', confidence: 'high' });
    } else if (['poor', 'terrible', 'hate', 'worst', 'useless'].some(w => content.includes(w))) {
      labels.push({ label: '[NEGATIVE]', confidence: 'high' });
    } else if (['good', 'helpful', 'useful', 'great'].some(w => content.includes(w))) {
      labels.push({ label: '[NEUTRAL_POSITIVE]', confidence: 'medium' });
    } else if (['confusing', 'unclear', 'missing', 'lacking'].some(w => content.includes(w))) {
      labels.push({ label: '[NEEDS_IMPROVEMENT]', confidence: 'medium' });
    }

    // Actionable detection
    if (['should', 'could', 'need', 'want', 'please'].some(w => content.includes(w))) {
      labels.push({ label: '[ACTIONABLE]', confidence: 'medium' });
    }

    // Uncertainty detection
    if (['maybe', 'perhaps', 'might', 'unsure', 'not sure'].some(w => content.includes(w))) {
      labels.push({ label: '[UNCERTAIN]', confidence: 'medium' });
    }

    return labels;
  }

  /**
   * Analyze all feedback for a client or globally
   */
  analyze(clientId = null) {
    const feedback = clientId 
      ? this.feedbackByClient.get(clientId) || []
      : this.feedbackHistory;

    const analysis = {
      id: `analysis-${Date.now()}`,
      clientId,
      timestamp: new Date().toISOString(),
      totalFeedback: feedback.length,
      byType: this.categorizeFeedback(feedback),
      satisfactionScore: this.calculateSatisfaction(feedback),
      recurringThemes: this.findRecurringThemes(feedback),
      actionItems: this.extractActionItems(feedback),
      epistemicWarnings: this.checkEpistemicCompliance(feedback)
    };

    return analysis;
  }

  categorizeFeedback(feedback) {
    const categories = {
      '[POSITIVE]': [],
      '[NEGATIVE]': [],
      '[NEUTRAL_POSITIVE]': [],
      '[NEEDS_IMPROVEMENT]': [],
      '[ACTIONABLE]': [],
      '[UNCERTAIN]': []
    };

    feedback.forEach(f => {
      f.labels?.forEach(l => {
        if (categories[l.label]) {
          categories[l.label].push(f);
        }
      });
    });

    return categories;
  }

  calculateSatisfaction(feedback) {
    if (feedback.length === 0) return { score: 0, label: '[UNKNOWN]' };

    let total = 0;
    let scored = 0;

    feedback.forEach(f => {
      const labels = f.labels || [];
      if (labels.some(l => l.label === '[POSITIVE]')) {
        total += 100;
        scored++;
      } else if (labels.some(l => l.label === '[NEUTRAL_POSITIVE]')) {
        total += 70;
        scored++;
      } else if (labels.some(l => l.label === '[NEGATIVE]')) {
        total += 25;
        scored++;
      }
    });

    const score = scored > 0 ? Math.round(total / scored) : 0;
    
    let label = '[UNCERTAIN]';
    if (score >= 80) label = '[POSITIVE]';
    else if (score >= 50) label = '[NEUTRAL]';
    else if (score >= 25) label = '[NEEDS_IMPROVEMENT]';
    else if (score > 0) label = '[NEGATIVE]';

    return { score, label, sampleSize: scored };
  }

  findRecurringThemes(feedback) {
    const themes = new Map();
    
    feedback.forEach(f => {
      const content = (f.content || '').toLowerCase();
      
      // Check for specific topics
      const topicKeywords = {
        'accuracy': ['accurate', 'correct', 'wrong', 'error', 'factual'],
        'timeliness': ['timely', 'late', 'slow', 'fast', 'quick', 'delay'],
        'relevance': ['relevant', 'useful', 'helpful', 'irrelevant', 'useless'],
        'depth': ['detailed', 'shallow', 'comprehensive', 'surface', 'deep'],
        'clarity': ['clear', 'confusing', 'understandable', 'unclear']
      };

      Object.entries(topicKeywords).forEach(([theme, keywords]) => {
        if (keywords.some(k => content.includes(k))) {
          const count = themes.get(theme) || 0;
          themes.set(theme, count + 1);
        }
      });
    });

    return Array.from(themes.entries())
      .map(([theme, count]) => ({ theme, count, label: '[INFERRED]' }))
      .sort((a, b) => b.count - a.count);
  }

  extractActionItems(feedback) {
    const items = [];
    
    feedback.forEach(f => {
      const labels = f.labels || [];
      if (labels.some(l => l.label === '[ACTIONABLE]')) {
        items.push({
          id: `action-${f.id}`,
          source: f.id,
          clientId: f.clientId,
          content: f.content,
          priority: labels.some(l => l.label === '[NEGATIVE]') ? 'high' : 'medium',
          status: 'pending'
        });
      }
    });

    return items;
  }

  checkEpistemicCompliance(feedback) {
    const warnings = [];
    
    feedback.forEach(f => {
      // Check if feedback itself uses epistemic labels correctly
      if (f.labels?.some(l => l.label === '[UNCERTAIN]' && l.confidence === 'high')) {
        warnings.push({
          type: 'questionable_certainty',
          feedbackId: f.id,
          message: 'Feedback marked [UNCERTAIN] with high confidence may itself confabulate'
        });
      }
    });

    return warnings;
  }

  /**
   * Generate feedback response
   */
  generateResponse(feedbackItem, analysis) {
    const response = {
      id: `response-${Date.now()}`,
      feedbackId: feedbackItem.id,
      timestamp: new Date().toISOString(),
      epistemicStatus: 'sol',
      content: this.composeResponse(feedbackItem, analysis),
      labels: this.analyzeFeedbackLabels({ content: this.composeResponse(feedbackItem, analysis) })
    };

    return response;
  }

  composeResponse(feedbackItem, analysis) {
    const hasNegative = feedbackItem.labels?.some(l => l.label === '[NEGATIVE]');
    const hasActionable = feedbackItem.labels?.some(l => l.label === '[ACTIONABLE]');
    
    let response = 'Thank you for your feedback. ';
    
    if (hasNegative) {
      response += 'We take your concerns seriously and ';
      if (hasActionable) {
        response += 'will address the specific issues you raised. ';
      } else {
        response += 'will work to improve. ';
      }
    } else {
      response += 'We appreciate your positive feedback. ';
    }

    if (hasActionable) {
      response += 'Your suggestions have been noted and will be considered for future updates. ';
    }

    response += '[UNCERTAIN] Response time may vary based on the complexity of your feedback.';

    return response;
  }

  /**
   * Get feedback trends over time
   */
  getTrends(clientId = null, days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const feedback = (clientId 
      ? this.feedbackByClient.get(clientId) || []
      : this.feedbackHistory
    ).filter(f => new Date(f.received) >= cutoff);

    const trend = {
      period: `${days} days`,
      total: feedback.length,
      byDay: this.aggregateByDay(feedback),
      satisfactionTrend: this.calculateTrend(feedback)
    };

    return trend;
  }

  aggregateByDay(feedback) {
    const byDay = new Map();
    
    feedback.forEach(f => {
      const day = new Date(f.received).toISOString().split('T')[0];
      const dayFeedback = byDay.get(day) || [];
      dayFeedback.push(f);
      byDay.set(day, dayFeedback);
    });

    return Array.from(byDay.entries())
      .map(([day, items]) => ({ day, count: items.length }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }

  calculateTrend(feedback) {
    // Simplified trend calculation
    const sorted = feedback.sort((a, b) => new Date(a.received) - new Date(b.received));
    if (sorted.length < 2) return { direction: 'stable', label: '[UNCERTAIN]' };

    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);

    const firstScore = this.calculateSatisfaction(firstHalf);
    const secondScore = this.calculateSatisfaction(secondHalf);

    const diff = secondScore.score - firstScore.score;
    
    let direction = 'stable';
    let label = '[UNCERTAIN]';
    if (diff > 10) { direction = 'improving'; label = '[POSITIVE]'; }
    else if (diff < -10) { direction = 'declining'; label = '[NEGATIVE]'; }

    return { direction, label, diff, firstHalfScore: firstScore.score, secondHalfScore: secondScore.score };
  }
}

module.exports = { FeedbackAgent };
