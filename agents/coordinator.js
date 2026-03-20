/**
 * Coordinator — Orchestrates the Abraxas Multi-Agent System
 * Part of the Abraxas Autonomous Agent System
 * 
 * The Coordinator manages workflow between all agents:
 *   - Research Agent → Briefing Agent → Outreach Agent
 *   - Briefing Agent → Delivery Agent
 *   - Feedback Agent ↔ all agents (loop back)
 *   - Billing Agent tracks all activity
 * 
 * Uses Abraxian epistemic framework:
 *   - All agent outputs are labeled
 *   - [UNKNOWN] propagates correctly through the pipeline
 *   - Anti-confabulation checks at each stage
 */

const { ResearchAgent } = require('./research-agent');
const { BriefingAgent } = require('./briefing-agent');
const { OutreachAgent } = require('./outreach-agent');
const { DeliveryAgent } = require('./delivery-agent');
const { FeedbackAgent } = require('./feedback-agent');
const { BillingAgent } = require('./billing-agent');

class Coordinator {
  constructor(config = {}) {
    this.name = 'Coordinator';
    this.model = config.model || 'ollama/minimax-m2.7:cloud';
    
    // Initialize all agents
    this.agents = {
      research: new ResearchAgent(config),
      briefing: new BriefingAgent(config),
      outreach: new OutreachAgent(config),
      delivery: new DeliveryAgent(config),
      feedback: new FeedbackAgent(config),
      billing: new BillingAgent(config)
    };

    // Workflow state
    this.workflows = new Map();
    this.activeWorkflows = [];
    this.completedWorkflows = [];
  }

  /**
   * Initialize a new research-to-delivery workflow
   */
  async createWorkflow(params) {
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const workflow = {
      id: workflowId,
      status: 'initialized',
      created: new Date().toISOString(),
      topic: params.topic,
      client: params.client,
      schedule: params.schedule || 'weekly',
      stages: {
        research: { status: 'pending', started: null, completed: null },
        briefing: { status: 'pending', started: null, completed: null },
        outreach: { status: 'pending', started: null, completed: null },
        delivery: { status: 'pending', started: null, completed: null },
        feedback: { status: 'pending', started: null, completed: null },
        billing: { status: 'pending', started: null, completed: null }
      },
      data: {
        findings: [],
        brief: null,
        outreachResults: null,
        deliveryRecord: null,
        feedbackAnalysis: null,
        invoice: null
      },
      epistemicStatus: 'sol'
    };

    this.workflows.set(workflowId, workflow);
    this.activeWorkflows.push(workflowId);

    return workflow;
  }

  /**
   * Execute the full research pipeline
   */
  async executeWorkflow(workflowId, options = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return { error: 'Workflow not found', label: '[UNKNOWN]' };
    }

    workflow.status = 'running';
    workflow.started = new Date().toISOString();

    const stages = options.stages || ['research', 'briefing', 'outreach', 'delivery'];
    const results = { stages: {} };

    for (const stage of stages) {
      try {
        results.stages[stage] = await this.executeStage(workflow, stage);
        
        if (results.stages[stage].error) {
          workflow.status = 'failed';
          workflow.failedAt = new Date().toISOString();
          workflow.failedStage = stage;
          break;
        }
      } catch (error) {
        results.stages[stage] = { error: error.message, label: '[UNKNOWN]' };
        workflow.status = 'failed';
        break;
      }
    }

    if (workflow.status === 'running') {
      workflow.status = 'completed';
      workflow.completed = new Date().toISOString();
      this.moveToCompleted(workflowId);
    }

    results.workflow = this.getWorkflowStatus(workflowId);
    return results;
  }

  /**
   * Execute a single stage of the workflow
   */
  async executeStage(workflow, stage) {
    const stageConfig = workflow.stages[stage];
    stageConfig.status = 'running';
    stageConfig.started = new Date().toISOString();

    let result;
    let label = '[INFERRED]';

    switch (stage) {
      case 'research':
        result = await this.runResearchStage(workflow);
        label = '[INFERRED]';
        break;
      
      case 'briefing':
        result = await this.runBriefingStage(workflow);
        label = '[INFERRED]';
        break;
      
      case 'outreach':
        result = await this.runOutreachStage(workflow);
        label = '[INFERRED]';
        break;
      
      case 'delivery':
        result = await this.runDeliveryStage(workflow);
        label = '[INFERRED]';
        break;
      
      case 'feedback':
        result = await this.runFeedbackStage(workflow);
        label = '[UNCERTAIN]';
        break;
      
      case 'billing':
        result = await this.runBillingStage(workflow);
        label = '[KNOWN]';
        break;
    }

    stageConfig.status = result.error ? 'failed' : 'completed';
    stageConfig.completed = new Date().toISOString();
    stageConfig.result = result;

    return { ...result, label };
  }

  async runResearchStage(workflow) {
    const research = this.agents.research;
    await research.init(workflow.topic, workflow.sources || []);
    
    // Run monitoring to gather findings
    const researchData = await research.monitor();
    
    // Apply epistemic labels
    if (researchData.findings.length === 0) {
      researchData.findings.push({
        id: `empty-${Date.now()}`,
        content: `No findings collected for topic: ${workflow.topic}`,
        label: '[UNKNOWN]',
        timestamp: new Date().toISOString()
      });
    }

    // Validate citations (anti-confabulation check)
    const warnings = research.validateCitations();
    if (warnings.length > 0) {
      console.log(`[${workflow.id}] Research warnings:`, warnings);
    }

    workflow.data.findings = researchData;
    return { status: 'completed', findingsCount: researchData.findings.length };
  }

  async runBriefingStage(workflow) {
    const briefing = this.agents.briefing;
    
    const brief = briefing.synthesize(workflow.data.findings, workflow.client, 'weekly');
    
    // Anti-confabulation: ensure confidence note is honest
    if (brief.sections.confidenceNote.confidence === 'low') {
      brief.sections.confidenceNote.note += 
        ' [UNCERTAIN] Low confidence indicates significant verification needed.';
    }

    workflow.data.brief = brief;
    return { status: 'completed', briefId: brief.id };
  }

  async runOutreachStage(workflow) {
    const outreach = this.agents.outreach;
    
    // Load prospects if provided
    const prospects = workflow.prospects || [];
    if (prospects.length > 0) {
      outreach.loadProspects(prospects);
    }

    // Send outreach using brief content
    const outreachResults = await outreach.sendOutreach(
      prospects,
      workflow.data.brief,
      workflow.channel || 'email'
    );

    workflow.data.outreachResults = outreachResults;
    return { 
      status: 'completed', 
      attempted: outreachResults.attempted,
      successful: outreachResults.successful
    };
  }

  async runDeliveryStage(workflow) {
    const delivery = this.agents.delivery;
    
    // Prepare brief for delivery
    const preparedBrief = delivery.prepareBrief(workflow.data.brief);
    
    // Deliver to specified channels
    const deliveryMethod = workflow.deliveryMethod || 'email';
    const deliveryRecord = await delivery.deliver(preparedBrief, deliveryMethod);

    workflow.data.deliveryRecord = deliveryRecord;
    return { status: 'completed', deliveryId: deliveryRecord.id, method: deliveryMethod };
  }

  async runFeedbackStage(workflow) {
    const feedback = this.agents.feedback;
    
    const analysis = feedback.analyze(workflow.client?.id);
    workflow.data.feedbackAnalysis = analysis;
    
    return { 
      status: 'completed', 
      satisfactionScore: analysis.satisfactionScore.score,
      label: analysis.satisfactionScore.label
    };
  }

  async runBillingStage(workflow) {
    const billing = this.agents.billing;
    
    // Ensure client is registered
    if (workflow.client?.id) {
      billing.registerClient(workflow.client);
      
      // Record usage
      const usageTypes = ['researchRequests', 'briefGeneration', 'outreachMessages', 'deliveryAttempts'];
      usageTypes.forEach(type => {
        billing.recordUsage(workflow.client.id, { type, quantity: 1 });
      });
    }

    return { status: 'completed', label: '[KNOWN]' };
  }

  /**
   * Process feedback from a client
   */
  async processFeedback(feedbackItem) {
    // Collect feedback
    const feedback = this.agents.feedback.collect(feedbackItem);

    // Analyze feedback
    const analysis = this.agents.feedback.analyze(feedbackItem.clientId);

    // Generate response
    const response = this.agents.feedback.generateResponse(feedback, analysis);

    // If negative feedback, trigger review workflow
    if (feedback.labels?.some(l => l.label === '[NEGATIVE]')) {
      await this.triggerReviewWorkflow(feedbackItem);
    }

    return {
      feedbackId: feedback.id,
      analysis,
      response,
      epistemicStatus: 'sol'
    };
  }

  async triggerReviewWorkflow(feedbackItem) {
    const workflow = await this.createWorkflow({
      topic: `Feedback Review: ${feedbackItem.clientId}`,
      client: { id: feedbackItem.clientId, name: feedbackItem.clientName }
    });

    workflow.stages.feedback.status = 'running';
    workflow.data.feedbackItem = feedbackItem;

    // Execute feedback stage
    const result = await this.executeStage(workflow, 'feedback');
    
    return { reviewWorkflowId: workflow.id, result };
  }

  /**
   * Generate workflow report
   */
  generateReport(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return { error: 'Workflow not found' };

    return {
      id: workflow.id,
      status: workflow.status,
      topic: workflow.topic,
      client: workflow.client?.name,
      created: workflow.created,
      completed: workflow.completed,
      stages: workflow.stages,
      metrics: {
        totalStages: Object.keys(workflow.stages).length,
        completedStages: Object.values(workflow.stages).filter(s => s.status === 'completed').length,
        failedStages: Object.values(workflow.stages).filter(s => s.status === 'failed').length
      },
      epistemicStatus: workflow.epistemicStatus
    };
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return { status: 'not_found' };

    return {
      id: workflow.id,
      status: workflow.status,
      topic: workflow.topic,
      activeStages: Object.entries(workflow.stages)
        .filter(([, s]) => s.status === 'running')
        .map(([name]) => name),
      completedStages: Object.entries(workflow.stages)
        .filter(([, s]) => s.status === 'completed')
        .map(([name]) => name)
    };
  }

  /**
   * List all workflows
   */
  listWorkflows(status = null) {
    const all = [...this.activeWorkflows, ...this.completedWorkflows];
    return all
      .map(id => this.workflows.get(id))
      .filter(w => !status || w.status === status)
      .map(w => ({
        id: w.id,
        status: w.status,
        topic: w.topic,
        client: w.client?.name,
        created: w.created
      }));
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      timestamp: new Date().toISOString(),
      activeWorkflows: this.activeWorkflows.length,
      completedWorkflows: this.completedWorkflows.length,
      agents: {
        research: this.agents.research.findings?.length || 0,
        briefing: { briefsGenerated: 0 },
        outreach: this.agents.outreach.getMetrics(),
        delivery: this.agents.delivery.getStatus(),
        feedback: { totalFeedback: this.agents.feedback.feedbackHistory.length },
        billing: this.agents.billing.getMetrics()
      },
      epistemicCompliance: this.checkSystemCompliance()
    };
  }

  checkSystemCompliance() {
    // Verify all workflows maintain epistemic labeling
    const workflows = Array.from(this.workflows.values());
    const unlabeled = workflows.filter(w => w.epistemicStatus !== 'sol');

    return {
      allWorkflowsLabeled: unlabeled.length === 0,
      totalWorkflows: workflows.length,
      note: 'All system outputs should use Abraxian epistemic labels'
    };
  }

  moveToCompleted(workflowId) {
    const idx = this.activeWorkflows.indexOf(workflowId);
    if (idx !== -1) {
      this.activeWorkflows.splice(idx, 1);
      this.completedWorkflows.push(workflowId);
    }
  }

  /**
   * Export system state for persistence
   */
  exportState() {
    return {
      workflows: Array.from(this.workflows.entries()),
      activeWorkflows: this.activeWorkflows,
      completedWorkflows: this.completedWorkflows,
      agentStates: {
        feedback: this.agents.feedback.feedbackHistory.length,
        billing: this.agents.billing.invoices.length
      }
    };
  }
}

module.exports = { Coordinator };
