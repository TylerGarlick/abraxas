import { expect, test, describe } from 'bun:test';
import { ReportGenerator } from '../src/lib/report/index';
import { SovereignNexus } from '../src/lib/core/nexus';

describe('ReportGenerator', () => {
  test('should generate a sovereign report with consensus seal and receipt', () => {
    const nexus = new SovereignNexus('Genesis');
    const generator = new ReportGenerator(nexus);
    const query = 'Is the system stable?';
    const analysis = {
      proven: ['Stable kernel', 'Verified anchors'],
      suspected: ['Minor drift in L2'],
      failed: ['L3 coherence check']
    };
    const score = 4;
    
    const report = generator.generate(query, analysis, score);
    
    expect(report.query).toBe(query);
    expect(report.consensus).toBe('[Sovereign Consensus: 4/5]');
    expect(report.analysis.proven).toContain('Stable kernel');
    expect(report.receipt).toBeDefined();
    expect(report.timestamp).toBeGreaterThan(0);
  });
});
