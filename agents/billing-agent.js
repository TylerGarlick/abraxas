/**
 * Billing Agent — Track Usage and Generate Invoices
 * Part of the Abraxas Autonomous Agent System
 * 
 * Inputs:
 *   - clientId: string
 *   - usageData: UsageRecord[]
 *   - billingPeriod: { start: Date, end: Date }
 * 
 * Outputs:
 *   - invoice: Invoice
 *   - usageSummary: UsageSummary
 *   - billingMetrics: BillingMetrics
 */

class BillingAgent {
  constructor(config = {}) {
    this.name = 'Billing Agent';
    this.model = config.model || 'ollama/minimax-m2.7:cloud';
    this.clients = new Map();
    this.invoices = [];
    this.usageRecords = [];
  }

  /**
   * Register a client for billing
   */
  registerClient(client) {
    const clientRecord = {
      id: client.id,
      name: client.name,
      email: client.email,
      plan: client.plan || 'standard',
      rates: this.getRatesForPlan(client.plan || 'standard'),
      registeredAt: new Date().toISOString(),
      status: 'active'
    };

    this.clients.set(client.id, clientRecord);
    return clientRecord;
  }

  getRatesForPlan(plan) {
    const rates = {
      standard: {
        researchRequests: 0.10,
        briefGeneration: 0.50,
        outreachMessages: 0.05,
        deliveryAttempts: 0.02,
        feedbackAnalysis: 0.15,
        storage: 0.001
      },
      premium: {
        researchRequests: 0.08,
        briefGeneration: 0.40,
        outreachMessages: 0.04,
        deliveryAttempts: 0.01,
        feedbackAnalysis: 0.12,
        storage: 0.0008
      },
      enterprise: {
        researchRequests: 0.05,
        briefGeneration: 0.25,
        outreachMessages: 0.02,
        deliveryAttempts: 0.005,
        feedbackAnalysis: 0.08,
        storage: 0.0005
      }
    };

    return rates[plan] || rates.standard;
  }

  /**
   * Record usage for a client
   */
  recordUsage(clientId, usage) {
    const record = {
      id: `usage-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      clientId,
      type: usage.type,
      quantity: usage.quantity || 1,
      metadata: usage.metadata || {},
      recorded: new Date().toISOString(),
      epistemicStatus: 'sol'
    };

    this.usageRecords.push(record);
    return record;
  }

  /**
   * Get usage for a client within a period
   */
  getUsage(clientId, startDate, endDate) {
    return this.usageRecords.filter(r => {
      const recordDate = new Date(r.recorded);
      return r.clientId === clientId && recordDate >= startDate && recordDate <= endDate;
    });
  }

  /**
   * Generate invoice for a billing period
   */
  generateInvoice(clientId, billingPeriod) {
    const client = this.clients.get(clientId);
    if (!client) {
      return { error: 'Client not found', label: '[UNKNOWN]' };
    }

    const usage = this.getUsage(clientId, billingPeriod.start, billingPeriod.end);
    const lineItems = this.calculateLineItems(usage, client.rates);
    
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.0; // No tax by default
    const total = subtotal + tax;

    const invoice = {
      id: `invoice-${Date.now()}`,
      clientId,
      clientName: client.name,
      clientEmail: client.email,
      billingPeriod: {
        start: billingPeriod.start.toISOString(),
        end: billingPeriod.end.toISOString()
      },
      lineItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      status: 'draft',
      created: new Date().toISOString(),
      dueDate: this.calculateDueDate(),
      epistemicStatus: 'sol'
    };

    this.invoices.push(invoice);
    return invoice;
  }

  calculateLineItems(usage, rates) {
    const grouped = new Map();

    usage.forEach(record => {
      const existing = grouped.get(record.type) || { quantity: 0, total: 0 };
      existing.quantity += record.quantity;
      existing.total += (rates[record.type] || 0) * record.quantity;
      grouped.set(record.type, existing);
    });

    return Array.from(grouped.entries()).map(([type, data]) => ({
      description: this.getDescriptionForType(type),
      quantity: data.quantity,
      rate: rates[type] || 0,
      total: Math.round(data.total * 100) / 100,
      label: '[KNOWN]'
    }));
  }

  getDescriptionForType(type) {
    const descriptions = {
      researchRequests: 'Research Requests',
      briefGeneration: 'Brief Generation',
      outreachMessages: 'Outreach Messages',
      deliveryAttempts: 'Delivery Attempts',
      feedbackAnalysis: 'Feedback Analysis',
      storage: 'Data Storage (GB/day)'
    };
    return descriptions[type] || type;
  }

  calculateDueDate() {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate.toISOString();
  }

  /**
   * Generate usage summary for a client
   */
  getUsageSummary(clientId, startDate, endDate) {
    const usage = this.getUsage(clientId, startDate, endDate);
    const client = this.clients.get(clientId);
    
    const byType = new Map();
    usage.forEach(r => {
      const existing = byType.get(r.type) || { count: 0, quantity: 0 };
      existing.count++;
      existing.quantity += r.quantity;
      byType.set(r.type, existing);
    });

    const totalRequests = usage.length;
    const uniqueDays = new Set(usage.map(r => r.recorded.split('T')[0])).size;

    return {
      clientId,
      clientName: client?.name,
      period: { start: startDate.toISOString(), end: endDate.toISOString() },
      totalRequests,
      uniqueDays,
      breakdown: Array.from(byType.entries()).map(([type, data]) => ({
        type,
        requests: data.count,
        quantity: data.quantity,
        estimatedCost: client ? (client.rates[type] || 0) * data.quantity : 0
      })),
      label: '[INFERRED]',
      note: 'Actual costs may vary based on final invoice calculation'
    };
  }

  /**
   * Get billing metrics
   */
  getMetrics() {
    const totalInvoices = this.invoices.length;
    const totalRevenue = this.invoices.reduce((sum, inv) => sum + inv.total, 0);
    const pendingInvoices = this.invoices.filter(i => i.status === 'pending' || i.status === 'draft');

    const byClient = new Map();
    this.invoices.forEach(inv => {
      const existing = byClient.get(inv.clientId) || { total: 0, count: 0 };
      existing.total += inv.total;
      existing.count++;
      byClient.set(inv.clientId, existing);
    });

    return {
      totalInvoices,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pendingInvoices: pendingInvoices.length,
      pendingAmount: pendingInvoices.reduce((sum, i) => sum + i.total, 0),
      byClient: Array.from(byClient.entries()).map(([clientId, data]) => ({
        clientId,
        total: Math.round(data.total * 100) / 100,
        invoiceCount: data.count
      })),
      activeClients: this.clients.size,
      epistemicCompliance: {
        allInvoicesLabeled: this.invoices.every(i => i.epistemicStatus === 'sol'),
        note: 'All billing records use [KNOWN] for line items and [INFERRED] for summaries'
      }
    };
  }

  /**
   * Update invoice status
   */
  updateInvoiceStatus(invoiceId, status) {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if (invoice) {
      invoice.status = status;
      invoice.updated = new Date().toISOString();
    }
    return invoice;
  }

  /**
   * Generate PDF-ready invoice data
   */
  formatInvoiceForPDF(invoice) {
    return {
      title: `INVOICE #${invoice.id}`,
      company: {
        name: 'Abraxas Autonomous Services',
        address: 'Research & Intelligence Division',
        email: 'billing@abraxas.example.com'
      },
      client: {
        name: invoice.clientName,
        email: invoice.clientEmail
      },
      billingPeriod: `${new Date(invoice.billingPeriod.start).toLocaleDateString()} - ${new Date(invoice.billingPeriod.end).toLocaleDateString()}`,
      lineItems: invoice.lineItems,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      dueDate: new Date(invoice.dueDate).toLocaleDateString(),
      status: invoice.status.toUpperCase()
    };
  }
}

module.exports = { BillingAgent };
