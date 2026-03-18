/**
 * Ergon - Tool Use Verification System
 * Main entry point
 */

export { ErgonWrapper } from './ergon-wrapper.js';
export * from './types.js';
export * from './validators/base-validator.js';
export * from './validators/json-validator.js';
export * from './validators/numeric-validator.js';
export * from './validators/code-validator.js';

// Convenience function for quick verification
import { ErgonWrapper, type VerificationReport } from './ergon-wrapper.js';

const ergon = new ErgonWrapper();

export function verifyTool<TInput, TOutput>(
  toolName: string,
  toolFn: Function,
  input: TInput,
  context?: Partial<{ timeout: number; expectedOutputType: string }>
): Promise<TOutput & { _ergon: VerificationReport }> {
  ergon.registerTool(toolName, toolFn);
  return ergon.invoke<TInput, TOutput>(toolName, input, context) as Promise<TOutput & { _ergon: VerificationReport }>;
}

export { ergon };