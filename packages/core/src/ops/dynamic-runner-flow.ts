import { HAMIFlow, HAMINodeConfigValidateResult } from '../types.js';
import { validateAgainstSchema, ValidationSchema } from '../validation.js';
import { DynamicRunnerNode } from './dynamic-runner.js';

/**
 * Configuration interface for the DynamicRunnerFlow.
 * Specifies the key used to retrieve the runner configuration value from shared data.
 */
export interface DynamicRunnerFlowConfig {
  runnerConfigValueKey: string;
}

/**
 * Validation schema for DynamicRunnerFlowConfig.
 * Ensures that the configuration contains the required runnerConfigValueKey as a string.
 */
const DynamicRunnerFlowConfigSchema: ValidationSchema = {
  type: 'object',
  properties: {
    runnerConfigValueKey: { type: 'string' },
  },
  required: ['runnerConfigValueKey'],
};

/**
 * DynamicRunnerFlow is a flow that wraps a DynamicRunnerNode to provide a complete workflow
 * for dynamically creating and running nodes based on configuration. It extends HAMIFlow and
 * manages the lifecycle of a single DynamicRunnerNode.
 *
 * Configuration:
 * - `runnerConfigValueKey`: A string key used to retrieve the node configuration from the shared state.
 *   This key is passed to the underlying DynamicRunnerNode as its nodeConfigKey.
 *
 * Expected shared state inputs:
 * - `shared[runnerConfigValueKey]`: An object containing `{ kind: string, config: any }`, where `kind` specifies
 *   the type of node to create and `config` provides the configuration for that node.
 * - `shared.registry`: An instance of HAMIRegistrationManager with a `createNode(kind: string, config: any)` method
 *   used to instantiate the dynamic node.
 */
export class DynamicRunnerFlow extends HAMIFlow<Record<string, any>, DynamicRunnerFlowConfig> {
  /** The starting node of the flow, which is a DynamicRunnerNode instance. */
  startNode: DynamicRunnerNode;

  /**
   * Constructs a new DynamicRunnerFlow instance.
   * Creates a DynamicRunnerNode with the nodeConfigKey set to the runnerConfigValueKey from config.
   * @param config The configuration object containing runnerConfigValueKey.
   */
  constructor(config: DynamicRunnerFlowConfig) {
    const startNode = new DynamicRunnerNode({ nodeConfigKey: config?.runnerConfigValueKey });
    super(startNode, config);
    this.startNode = startNode;
  }

  /**
   * Returns the kind identifier for this flow, which is 'core:dynamic-runner-flow'.
   * @returns The string 'core:dynamic-runner-flow'.
   */
  kind(): string {
    return 'core:dynamic-runner-flow';
  }

  /**
   * Validates the provided configuration against the schema.
   * Checks that runnerConfigValueKey is present and is a string.
   * @param config The configuration object to validate.
   * @returns An object indicating if the config is valid and any validation errors.
   */
  validateConfig(config: DynamicRunnerFlowConfig): HAMINodeConfigValidateResult {
    const result = validateAgainstSchema(config, DynamicRunnerFlowConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }
}