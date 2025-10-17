import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from '@hami/core';
import { homedir } from 'os';
import { join as pathJoin } from 'path';
import { Node } from 'pocketflow';

export function startContext(): Record<string, any> {
  let userHomeDirectory = homedir();
  let context: Record<string, any> = {
    workingDirectory: process.cwd(),
    hamiDirectory: pathJoin(process.cwd(), '.hami'),
    userHomeDirectory: userHomeDirectory,
    userHamiDirectory: pathJoin(userHomeDirectory, '.hami')
  }
  return context;
}

export class LogResult extends Node {
  private resultKey: string;
  constructor(resultKey: string) {
    super();
    this.resultKey = resultKey;
  }
  async prep(shared: Record<string, any>): Promise<any | undefined> {
    return shared[this.resultKey];
  }
  async exec(prepRes: any | undefined): Promise<void> {
    if (prepRes) {
      console.log('result(s):', prepRes);
    }
  }
}

export class LogErrorNode extends Node {
  private errorKey: string;
  constructor(errorKey: string) {
    super();
    this.errorKey = errorKey;
  }
  async prep(shared: Record<string, any>): Promise<any | undefined> {
    return shared[this.errorKey];
  }
  async exec(prepRes: any | undefined): Promise<void> {
    if (prepRes) {
      console.log('error(s):', prepRes);
    }
  }
}

type DynamicRunnerFlowConfig = {
  runnerConfigValueKey: string;
}

const DynamicRunnerFlowConfigSchema : ValidationSchema = {
  type: 'object',
  properties: {
    runnerConfigValueKey: { type: 'string' },
  },
  required: ['runnerConfigValueKey'],
}

export class DynamicRunnerFlow extends HAMIFlow<Record<string, any>, DynamicRunnerFlowConfig>  {
  startNode: Node | undefined = undefined;
  config : DynamicRunnerFlowConfig | undefined = undefined;
  kind(): string {
    return "hami-cli:dynamic-runner-flow";
  }

  constructor(config: DynamicRunnerFlowConfig) {
    const startNode = new DynamicRunnerNode(config.runnerConfigValueKey);
    super(startNode, config);
    this.startNode = startNode;
    this.config = config;
  }

  validateConfig(config: DynamicRunnerFlowConfig): HAMINodeConfigValidateResult { 
    const result = validateAgainstSchema(config, DynamicRunnerFlowConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }
}

export class DynamicRunnerNode extends Node {
  nodeConfigKey: string;
  constructor(configKey: string) {
    super();
    this.nodeConfigKey = configKey;
  }

  async prep(shared: Record<string, any>): Promise<Node|string> {
    if (!this.nodeConfigKey) {
      return 'No nodeConfig key found';
    }
    if (!shared[this.nodeConfigKey]) {
      return 'No nodeConfig value found';
    }
    if (!shared.registry) {
      return 'No registry found';
    }
    const { kind, config } = shared[this.nodeConfigKey];
    if (!kind || !config) {
      return 'Invalid nodeConfig format - need both kind and config';
    }
    return shared.registry.createNode(kind, config);
  }
  async post(
    shared: Record<string, any>,
    prepRes: Node|string,
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