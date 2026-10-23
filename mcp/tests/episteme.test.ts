import { expect, test, describe } from 'bun:test';
import { EpistemeLogic } from '../src/lib/epistemic/episteme';

describe('EpistemeLogic', () => {
  test('should map claims to origins', () => {
    const episteme = new EpistemeLogic();
    episteme.mapClaim('c1', 'Direct', ['source1']);
    episteme.mapClaim('c2', 'Inferred', ['source2']);
    episteme.mapClaim('c3', 'Artifact', ['source3']);
    
    expect(episteme.traceClaim('c1')?.origin).toBe('Direct');
    expect(episteme.traceClaim('c2')?.origin).toBe('Inferred');
    expect(episteme.traceClaim('c3')?.origin).toBe('Artifact');
  });

  test('should audit origins correctly', () => {
    const episteme = new EpistemeLogic();
    episteme.mapClaim('c1', 'Direct', []);
    episteme.mapClaim('c2', 'Direct', []);
    episteme.mapClaim('c3', 'Inferred', []);
    
    const audit = episteme.auditOrigins();
    expect(audit.Direct).toBe(2);
    expect(audit.Inferred).toBe(1);
    expect(audit.Artifact).toBe(0);
  });

  test('should calibrate correctly', () => {
    const episteme = new EpistemeLogic();
    episteme.mapClaim('c1', 'Direct', []);
    episteme.mapClaim('c2', 'Inferred', []);
    
    const calibration = episteme.calibrate();
    expect(calibration.total).toBe(2);
    expect(calibration.distribution.Direct).toBe(1);
    expect(calibration.distribution.Inferred).toBe(1);
  });
});
