import { HAMINode } from '../types.js';

/**
 * Configuration interface for the LogErrorNode.
 * Defines how errors should be logged, including the key to retrieve errors from shared state,
 * an optional prefix for the log message, and whether to include timestamps.
 */
export interface LogErrorConfig {
  errorKey: string;
  prefix?: string;
  includeTimestamp?: boolean;
}

/**
 * LogErrorNode is a core operation node that logs error information from the shared state to the console.
 * It extends HAMINode and is used for error reporting and debugging in HAMI workflows.
 *
 * Configuration:
 * - `errorKey`: A string key used to retrieve the error data from the shared state.
 * - `prefix` (optional): A string prefix to prepend to the error log message (defaults to 'error(s):').
 * - `includeTimestamp` (optional): A boolean indicating whether to include an ISO timestamp in the log message (defaults to false).
 *
 * Expected shared state inputs:
 * - `shared[errorKey]`: The error data to be logged (can be any type, typically an error object, string, or array of errors).
 */
export class LogErrorNode extends HAMINode<Record<string, any>, LogErrorConfig> {
  /**
   * Constructs a new LogErrorNode instance.
   * @param config Optional configuration object containing errorKey, prefix, and includeTimestamp.
   * @param maxRetries Optional maximum number of retries for node execution.
   * @param wait Optional wait time between retries in milliseconds.
   */
  constructor(config?: LogErrorConfig, maxRetries?: number, wait?: number) {
    super(config, maxRetries, wait);
  }

  /**
   * Returns the kind identifier for this node, which is 'core:log-error'.
   * @returns The string 'core:log-error'.
   */
  kind(): string {
    return 'core:log-error';
  }

  /**
   * Prepares the error data by retrieving it from the shared state using the configured errorKey.
   * @param shared The shared data object containing error information.
   * @returns A promise that resolves to the error data from shared state, or undefined if not found.
   */
  async prep(shared: Record<string, any>): Promise<any | undefined> {
    return shared[this.config!.errorKey];
  }

  /**
   * Executes the logging operation by outputting the prepared error data to the console.
   * Includes optional timestamp and prefix based on configuration.
   * @param prepRes The prepared error data from the prep method.
   * @returns A promise that resolves when the logging is complete.
   */
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