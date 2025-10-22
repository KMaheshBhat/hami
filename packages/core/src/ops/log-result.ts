import { HAMINode } from '../types.js';

/** Supported logging formats for result output. */
export type LogFormat = 'generic' | 'table' | 'json' | 'custom';

/**
 * Configuration interface for the LogResultNode.
 * Defines how results should be logged, including the key to retrieve results from shared state,
 * formatting options, and customization settings.
 */
export interface LogResultConfig {
  resultKey: string;
  format?: LogFormat;
  prefix?: string;
  emptyMessage?: string;
  includeTimestamp?: boolean;
  customFormatter?: (data: any, context: LogContext) => string;
  verbose?: boolean;
}

/**
 * Context information available during logging operations.
 * Provides metadata about the current operation and timing.
 */
export interface LogContext {
  timestamp: Date;
  command?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

/**
 * LogResultNode is a core operation node that logs result information from the shared state to the console
 * with various formatting options. It extends HAMINode and is used for result reporting and debugging
 * in HAMI workflows.
 *
 * Configuration:
 * - `resultKey`: A string key used to retrieve the result data from the shared state.
 * - `format` (optional): The logging format - 'generic', 'table', 'json', or 'custom' (defaults to 'generic').
 * - `prefix` (optional): A string prefix for generic format logging (defaults to 'result(s):').
 * - `emptyMessage` (optional): Message to display when no results are found (only shown in verbose mode).
 * - `includeTimestamp` (optional): Whether to include an ISO timestamp in the log message (defaults to false).
 * - `customFormatter` (optional): A custom function to format the output when format is 'custom'.
 * - `verbose` (optional): Whether to show additional information like empty messages (defaults to false).
 *
 * Expected shared state inputs:
 * - `shared[resultKey]`: The result data to be logged (can be any type - string, object, array, etc.).
 */
export class LogResultNode extends HAMINode<Record<string, any>, LogResultConfig> {
  /** Internal context object containing timestamp and metadata for logging operations. */
  private context: LogContext;

  /**
   * Constructs a new LogResultNode instance.
   * Initializes the logging context with current timestamp.
   * @param config Optional configuration object containing resultKey and formatting options.
   * @param maxRetries Optional maximum number of retries for node execution.
   * @param wait Optional wait time between retries in milliseconds.
   */
  constructor(config?: LogResultConfig, maxRetries?: number, wait?: number) {
    super(config, maxRetries, wait);
    this.context = {
      timestamp: new Date(),
      metadata: {}
    };
  }

  /**
   * Returns the kind identifier for this node, which is 'core:log-result'.
   * @returns The string 'core:log-result'.
   */
  kind(): string {
    return 'core:log-result';
  }

  /**
   * Prepares the result data by retrieving it from the shared state using the configured resultKey.
   * Updates the context metadata with the current shared state.
   * @param shared The shared data object containing result information.
   * @returns A promise that resolves to the result data from shared state, or undefined if not found.
   */
  async prep(shared: Record<string, any>): Promise<any | undefined> {
    this.context.metadata = { ...shared };
    return shared[this.config!.resultKey];
  }

  /**
   * Executes the logging operation by formatting and outputting the prepared result data to the console.
   * Handles empty results and delegates formatting to appropriate methods based on configuration.
   * @param prepRes The prepared result data from the prep method.
   * @returns A promise that resolves when the logging is complete.
   */
  async exec(prepRes: any | undefined): Promise<void> {
    if (!prepRes) {
      this.logEmptyResult();
      return;
    }

    const formattedOutput = this.formatOutput(prepRes);
    this.printOutput(formattedOutput);
  }

  /**
   * Formats the output data based on the configured format type.
   * @param data The data to format.
   * @returns The formatted string output.
   */
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

  /**
   * Formats data as a table using console.table, with optional verbose logging.
   * Falls back to generic formatting for non-table-compatible data.
   * @param data The data to format as a table.
   * @param timestamp The timestamp prefix string.
   * @returns The formatted output string.
   */
  private formatAsTable(data: any, timestamp: string): string {
    if (Array.isArray(data) || typeof data === 'object') {
      console.table(data);
      return this.config!.verbose ? timestamp + 'Results displayed as table' : '';
    }
    return this.formatAsGeneric(data, timestamp);
  }

  /**
   * Formats data as pretty-printed JSON.
   * @param data The data to format as JSON.
   * @param timestamp The timestamp prefix string.
   * @returns The JSON-formatted output string.
   */
  private formatAsJson(data: any, timestamp: string): string {
    return timestamp + JSON.stringify(data, null, 2);
  }

  /**
   * Formats data using a generic string representation with optional prefix.
   * @param data The data to format generically.
   * @param timestamp The timestamp prefix string.
   * @returns The generically formatted output string.
   */
  private formatAsGeneric(data: any, timestamp: string): string {
    return timestamp + (this.config!.prefix || 'result(s):') + ' ' + String(data);
  }

  /**
   * Logs a message when no results are found, only if verbose mode is enabled.
   */
  private logEmptyResult(): void {
    if (this.config!.verbose) {
      console.log(this.config!.emptyMessage || 'No results found.');
    }
  }

  /**
   * Prints the formatted output to the console.
   * @param output The formatted output string to print.
   */
  private printOutput(output: string): void {
    console.log(output);
  }
}