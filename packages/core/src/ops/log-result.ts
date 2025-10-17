import { HAMINode } from '../types.js';

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

export class LogResultNode extends HAMINode<Record<string, any>, LogResultConfig> {
  private context: LogContext;

  constructor(config?: LogResultConfig, maxRetries?: number, wait?: number) {
    super(config, maxRetries, wait);
    this.context = {
      timestamp: new Date(),
      metadata: {}
    };
  }

  kind(): string {
    return 'core:log-result';
  }

  async prep(shared: Record<string, any>): Promise<any | undefined> {
    this.context.metadata = { ...shared };
    return shared[this.config!.resultKey];
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
    const timestamp = this.config!.includeTimestamp
      ? `[${this.context.timestamp.toISOString()}] `
      : '';

    switch (this.config!.format) {
      case 'table':
        return this.formatAsTable(data, timestamp);
      case 'json':
        return this.formatAsJson(data, timestamp);
      case 'custom':
        return this.config!.customFormatter?.(data, this.context) || timestamp + String(data);
      default:
        return this.formatAsGeneric(data, timestamp);
    }
  }

  private formatAsTable(data: any, timestamp: string): string {
    if (Array.isArray(data) || typeof data === 'object') {
      console.table(data);
      return this.config!.verbose ? timestamp + 'Results displayed as table' : '';
    }
    return this.formatAsGeneric(data, timestamp);
  }

  private formatAsJson(data: any, timestamp: string): string {
    return timestamp + JSON.stringify(data, null, 2);
  }

  private formatAsGeneric(data: any, timestamp: string): string {
    return timestamp + (this.config!.prefix || 'result(s):') + ' ' + String(data);
  }

  private logEmptyResult(): void {
    if (this.config!.verbose) {
      console.log(this.config!.emptyMessage || 'No results found.');
    }
  }

  private printOutput(output: string): void {
    console.log(output);
  }
}