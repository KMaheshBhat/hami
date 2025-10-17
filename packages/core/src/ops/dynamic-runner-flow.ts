import { HAMIFlow, HAMINodeConfigValidateResult } from '../types.js';
import { validateAgainstSchema, ValidationSchema } from '../validation.js';
import { DynamicRunnerNode } from './dynamic-runner.js';

export interface DynamicRunnerFlowConfig {
  runnerConfigValueKey: string;
}

const DynamicRunnerFlowConfigSchema: ValidationSchema = {
  type: 'object',
  properties: {
    runnerConfigValueKey: { type: 'string' },
  },
  required: ['runnerConfigValueKey'],
};

export class DynamicRunnerFlow extends HAMIFlow<Record<string, any>, DynamicRunnerFlowConfig> {
  startNode: DynamicRunnerNode;

  constructor(config: DynamicRunnerFlowConfig) {
    const startNode = new DynamicRunnerNode({ nodeConfigKey: config?.runnerConfigValueKey });
    super(startNode, config);
    this.startNode = startNode;
  }

  kind(): string {
    return 'core:dynamic-runner-flow';
  }

  validateConfig(config: DynamicRunnerFlowConfig): HAMINodeConfigValidateResult {
    const result = validateAgainstSchema(config, DynamicRunnerFlowConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }
}