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

/**
 * @deprecated Use EnhancedLogResult instead. This class is kept for backward compatibility
 * but will be removed in a future version. EnhancedLogResult provides configurable
 * output formats, prefixes, timestamps, and better data type handling.
 */
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
export type LogFormat = 'generic' | 'table' | 'json' | 'custom';

export interface LogResultConfig {
  resultKey: string;
  format?: LogFormat;
  prefix?: string;
  emptyMessage?: string;
  includeTimestamp?: boolean;
  customFormatter?: (data: any, context: LogContext) => string;
  verbose?: boolean;
}

export interface LogContext {
  timestamp: Date;
  command?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

export class EnhancedLogResult extends Node {
  private config: LogResultConfig;
  private context: LogContext;

  constructor(config: LogResultConfig) {
    super();
    this.config = {
      format: 'generic',
      prefix: 'result(s):',
      emptyMessage: 'No results found.',
      includeTimestamp: false,
      verbose: false,
      ...config
    };
    this.context = {
      timestamp: new Date(),
      metadata: {}
    };
  }

  async prep(shared: Record<string, any>): Promise<any | undefined> {
    this.context.metadata = { ...shared };
    return shared[this.config.resultKey];
  }

  async exec(prepRes: any | undefined): Promise<void> {
    if (!prepRes) {
      this.logEmptyResult();
      return;
    }

    const formattedOutput = this.formatOutput(prepRes);
    this.printOutput(formattedOutput);
  }

  private formatOutput(data: any): string {
    const timestamp = this.config.includeTimestamp
      ? `[${this.context.timestamp.toISOString()}] `
      : '';

    switch (this.config.format) {
      case 'table':
        return this.formatAsTable(data, timestamp);
      case 'json':
        return this.formatAsJson(data, timestamp);
      case 'custom':
        return this.config.customFormatter?.(data, this.context) || timestamp + String(data);
      default:
        return this.formatAsGeneric(data, timestamp);
    }
  }

  private formatAsTable(data: any, timestamp: string): string {
    if (Array.isArray(data) || typeof data === 'object') {
      console.table(data);
      return this.config.verbose ? timestamp + 'Results displayed as table' : '';
    }
    return this.formatAsGeneric(data, timestamp);
  }

  private formatAsJson(data: any, timestamp: string): string {
    return timestamp + JSON.stringify(data, null, 2);
  }

  private formatAsGeneric(data: any, timestamp: string): string {
    return timestamp + this.config.prefix + ' ' + String(data);
  }

  private logEmptyResult(): void {
    if (this.config.verbose) {
      console.log(this.config.emptyMessage || 'No results found.');
    }
  }

  private printOutput(output: string): void {
    console.log(output);
  }
}

export function createTableLogger(resultKey: string, prefix: string) {
  return new EnhancedLogResult({ resultKey, format: 'table', prefix });
}

export function createJsonLogger(resultKey: string, includeTimestamp = false) {
  return new EnhancedLogResult({ resultKey, format: 'json', includeTimestamp });
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