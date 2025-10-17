import { HAMINode } from '../types.js';

export interface DynamicRunnerConfig {
  nodeConfigKey: string;
}

export class DynamicRunnerNode extends HAMINode<Record<string, any>, DynamicRunnerConfig> {
  constructor(config?: DynamicRunnerConfig, maxRetries?: number, wait?: number) {
    super(config, maxRetries, wait);
  }

  kind(): string {
    return 'core:dynamic-runner';
  }

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