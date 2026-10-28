// @ts-nocheck
import { expect, test, describe } from 'bun:test';
import { PraxisLogic } from '../src/lib/praxis/index';

describe('PraxisLogic', () => {
  test('should synthesize an action roadmap', () => {
    const praxis = new PraxisLogic();
    const analysis = {
      logos: { conclusion: 'The system is stable' },
      janus: { confidence: 0.9 },
      agon: { conflicts: [] }
    };
    
    const roadmap = praxis.synthesize(analysis);
    expect(roadmap.primaryActions.length).toBe(1);
    expect(roadmap.primaryActions[0].priority).toBe('High');
    expect(roadmap.contingencies).toEqual({});
  });

  test('should include contingencies when conflicts exist', () => {
    const praxis = new PraxisLogic();
    const analysis = {
      logos: { conclusion: 'The system is unstable' },
      janus: { confidence: 0.6 },
      agon: { conflicts: ['Conflict A'] }
    };
    
    const roadmap = praxis.synthesize(analysis);
    expect(roadmap.primaryActions[0].priority).toBe('Medium');
    expect(roadmap.contingencies['ConflictResolution']).toBeDefined();
    expect(roadmap.contingencies['ConflictResolution'].length).toBe(1);
  });
});
