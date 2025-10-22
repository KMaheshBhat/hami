import { HAMINode } from '../types.js';

/**
 * Configuration interface for the DynamicRunnerNode.
 * Specifies the key used to retrieve node configuration from shared data.
 */
export interface DynamicRunnerConfig {
  nodeConfigKey: string;
}

/**
 * DynamicRunnerNode is a core operation node that dynamically creates and runs other nodes
 * based on configuration retrieved from shared data. It extends HAMINode and is used for
 * runtime node instantiation in HAMI workflows.
 *
 * Configuration:
 * - `nodeConfigKey`: A string key used to retrieve the node configuration from the shared state.
 *
 * Expected shared state inputs:
 * - `shared[nodeConfigKey]`: An object containing `{ kind: string, config: any }`, where `kind` specifies
 *   the type of node to create and `config` provides the configuration for that node.
 * - `shared.registry`: An instance of HAMIRegistrationManager with a `createNode(kind: string, config: any)` method
 *   used to instantiate the dynamic node.
 */
export class DynamicRunnerNode extends HAMINode<Record<string, any>, DynamicRunnerConfig> {
  /**
   * Constructs a new DynamicRunnerNode instance.
   * @param config Optional configuration object containing the nodeConfigKey.
   * @param maxRetries Optional maximum number of retries for node execution.
   * @param wait Optional wait time between retries in milliseconds.
   */
  constructor(config?: DynamicRunnerConfig, maxRetries?: number, wait?: number) {
    super(config, maxRetries, wait);
  }

  /**
   * Returns the kind identifier for this node, which is 'core:dynamic-runner'.
   * @returns The string 'core:dynamic-runner'.
   */
  kind(): string {
    return 'core:dynamic-runner';
  }

  /**
   * Prepares the node by retrieving configuration from shared data and creating a new node instance.
   * Validates the presence of required keys and creates a node using the registry.
   * @param shared The shared data object containing node configuration and registry.
   * @returns A promise that resolves to either an error string or the created node instance.
   */
  async prep(shared: Record<string, any>): Promise<any> {
    const nodeConfigKey = this.config!.nodeConfigKey;
    if (!nodeConfigKey) {
      return 'No nodeConfig key found';
    }
    if (!shared[nodeConfigKey]) {
      return 'No nodeConfig value found';
    }
    if (!shared.registry) {
      return 'No registry found';
    }
    const { kind, config } = shared[nodeConfigKey];
    if (!kind || !config) {
      return 'Invalid nodeConfig format - need both kind and config';
    }
    return shared.registry.createNode(kind, config);
  }

  /**
   * Handles post-execution logic. If preparation failed (returned a string), sets an error in shared data.
   * Otherwise, sets the created node as the next node to execute.
   * @param shared The shared data object.
   * @param prepRes The result from the prep method (either an error string or a node instance).
   * @param _execRes The execution result (unused in this implementation).
   * @returns A promise that resolves to 'error' if prep failed, 'default' otherwise.
   */
  async post(
    shared: Record<string, any>,
    prepRes: any,
    _execRes: unknown,
  ): Promise<string | undefined> {
    if (typeof prepRes === 'string') {
      shared['runnerError'] = prepRes;
      return 'error';
    }
    this.next(prepRes);
    return 'default';
  }
}