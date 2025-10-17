import { HAMINode } from '../types.js';

export interface LogErrorConfig {
  errorKey: string;
  prefix?: string;
  includeTimestamp?: boolean;
}

export class LogErrorNode extends HAMINode<Record<string, any>, LogErrorConfig> {
  constructor(config?: LogErrorConfig, maxRetries?: number, wait?: number) {
    super(config, maxRetries, wait);
  }

  kind(): string {
    return 'core:log-error';
  }

  async prep(shared: Record<string, any>): Promise<any | undefined> {
    return shared[this.config!.errorKey];
  }

  async exec(prepRes: any | undefined): Promise<void> {
    if (prepRes) {
      const timestamp = this.config!.includeTimestamp
        ? `[${new Date().toISOString()}] `
        : '';
      const prefix = this.config!.prefix || 'error(s):';
      console.log(timestamp + prefix, prepRes);
    }
  }
}