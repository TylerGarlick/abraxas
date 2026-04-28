/**
 * Zod schemas for Sovereign Config validation
 * 
 * These schemas define the structure and constraints for SOVEREIGN_CONFIG.yaml
 * All config values are validated against these schemas on load and reload.
 */

import { z } from 'zod';

// Core identity settings
const CoreSchema = z.object({
  Name: z.string().min(1),
  Version: z.string().regex(/^\d+\.\d+\.\d+$/),
  Mode: z.enum(['sovereign', 'simulation']),
  Timezone: z.string().min(1)
});

// Soter (The Shield) - Safety & Risk Management
const SoterSchema = z.object({
  Enabled: z.boolean(),
  RiskThreshold: z.number().min(0).max(5),
  PatternLibrary: z.enum(['default', 'strict', 'permissive']),
  LedgerPath: z.string().min(1),
  HumanReviewRequired: z.boolean()
});

// Ethos (The Soul) - Identity & Voice
const EthosSchema = z.object({
  Enabled: z.boolean(),
  DriftThreshold: z.number().min(0).max(100),
  VoiceProfile: z.string().min(1),
  RestoreOnDrift: z.boolean()
});

// Aletheia (The Truth) - Epistemic Integrity
const AletheiaSchema = z.object({
  Enabled: z.boolean(),
  LedgerPath: z.string().min(1),
  ClaimVerification: z.enum(['strict', 'relaxed']),
  CalibrationReviewDays: z.number().positive()
});

// Ergon (The Gate) - Request Routing
const ErgonSchema = z.object({
  Gate: z.object({
    Enabled: z.boolean(),
    InterceptTools: z.boolean(),
    LogAllRequests: z.boolean()
  }),
  Routing: z.object({
    DefaultTarget: z.string().min(1),
    FallbackTarget: z.string().min(1)
  })
});

// Infrastructure settings
const InfrastructureSchema = z.object({
  Paths: z.object({
    Workspace: z.string().min(1),
    Projects: z.string().min(1),
    Skills: z.string().min(1),
    Mcps: z.string().min(1)
  }),
  Timeouts: z.object({
    MCPRequest: z.number().positive(),
    ToolExecution: z.number().positive(),
    Subagent: z.number().positive()
  }),
  Limits: z.object({
    MaxConcurrentSubagents: z.number().positive(),
    MaxHeartbeatsPerDay: z.number().positive(),
    MaxConfigGetsPerMinute: z.number().positive()
  })
});

// Skill-specific configs (flexible schema)
const SkillsSchema = z.record(z.string(), z.record(z.string(), z.any())).optional();

// Logging configuration
const LoggingSchema = z.object({
  Level: z.enum(['debug', 'info', 'warn', 'error']),
  Format: z.enum(['json', 'text']),
  Output: z.enum(['file', 'stdout', 'both']),
  Path: z.string().min(1)
});

// Complete Sovereign Config schema
export const SovereignConfigSchema = z.object({
  Core: CoreSchema,
  Soter: SoterSchema,
  Ethos: EthosSchema,
  Aletheia: AletheiaSchema,
  Ergon: ErgonSchema,
  Infrastructure: InfrastructureSchema,
  Skills: SkillsSchema,
  Logging: LoggingSchema
});

// Type inference
export type SovereignConfig = z.infer<typeof SovereignConfigSchema>;
export type CoreConfig = z.infer<typeof CoreSchema>;
export type SoterConfig = z.infer<typeof SoterSchema>;
export type EthosConfig = z.infer<typeof EthosSchema>;
export type AletheiaConfig = z.infer<typeof AletheiaSchema>;
export type ErgonConfig = z.infer<typeof ErgonSchema>;
export type InfrastructureConfig = z.infer<typeof InfrastructureSchema>;
export type LoggingConfig = z.infer<typeof LoggingSchema>;

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  config?: SovereignConfig;
}

/**
 * Validate a config object against the schema
 */
export function validateConfig(config: unknown): ValidationResult {
  const result = SovereignConfigSchema.safeParse(config);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    );
    return { valid: false, errors };
  }
  
  return { valid: true, errors: [], config: result.data };
}
