/**
 * Abraxas Autonomous Agent System
 * 
 * A multi-agent research and delivery system using the Abraxian epistemic framework.
 * 
 * @author Tyler Garlick
 * @license MIT
 * 
 * Usage:
 *   const { Coordinator, ResearchAgent, BriefingAgent, ... } = require('./agents');
 *   
 *   const coordinator = new Coordinator();
 *   const workflow = await coordinator.createWorkflow({ topic: 'market trends', client: { name: 'Acme Corp' } });
 *   const results = await coordinator.executeWorkflow(workflow.id);
 */

const { ResearchAgent } = require('./research-agent');
const { BriefingAgent } = require('./briefing-agent');
const { OutreachAgent } = require('./outreach-agent');
const { DeliveryAgent } = require('./delivery-agent');
const { FeedbackAgent } = require('./feedback-agent');
const { BillingAgent } = require('./billing-agent');
const { Coordinator } = require('./coordinator');

module.exports = {
  // Individual agents
  ResearchAgent,
  BriefingAgent,
  OutreachAgent,
  DeliveryAgent,
  FeedbackAgent,
  BillingAgent,
  
  // Orchestrator
  Coordinator,
  
  // Factory function for quick setup
  createSystem: (config = {}) => {
    const coordinator = new Coordinator(config);
    return {
      coordinator,
      agents: coordinator.agents,
      startWorkflow: (params) => coordinator.createWorkflow(params),
      executeWorkflow: (workflowId, options) => coordinator.executeWorkflow(workflowId, options),
      getStatus: () => coordinator.getSystemStatus()
    };
  }
};
