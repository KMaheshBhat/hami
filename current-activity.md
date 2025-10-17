# HAMI Project: LogResult Enhancement Analysis

## Overview
**Short Name**: "Enhanced LogResult Node"

**Context**: The current `LogResult` implementation in `apps/hami-cli/src/cmd/common.ts` is a simple logging node that prints results using `console.log`. While functional, it lacks flexibility for different logging formats, prefixes, and output styles needed across various CLI operations.

**Location**: `apps/hami-cli/src/cmd/common.ts` - `LogResult` class (lines 17-31)
**Related Files**:
- `apps/hami-cli/src/cmd/flow.ts` - Current usage in `handleFlowRun()`
- `apps/hami-cli/src/cmd/config.ts` - Direct `console.log`/`console.table` usage patterns
- `apps/hami-cli/src/cmd/trace.ts` - Mixed logging patterns
- `packages/core/src/types.ts` - HAMINode/HAMIFlow definitions

## Current Implementation Analysis

### What We Have Now
The current `LogResult` implementation is minimal:

```typescript
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
```

### Current Usage Patterns
1. **In `handleFlowRun()`**: `new LogResult("results")` - prints flow execution results
2. **Direct console usage** in other commands:
   - `console.log()` for single values
   - `console.table()` for tabular data
   - `JSON.stringify()` for structured data
   - Conditional logging with custom messages

### Identified Limitations
1. **Fixed output format**: Always uses `console.log('result(s):', prepRes)`
2. **No prefix customization**: Cannot add context-specific prefixes
3. **No format selection**: Cannot switch between table and generic log formats
4. **No conditional logic**: Cannot handle different data types appropriately
5. **No styling options**: No colors, emphasis, or formatting
6. **No metadata support**: Cannot include timestamps or execution context

## Enhancement Opportunities

### 1. Configurable Output Format
Support multiple output formats:
- **Generic**: `console.log()` with customizable prefix
- **Table**: `console.table()` for array/object data
- **JSON**: `JSON.stringify()` for structured data
- **Custom**: User-defined formatting function

### 2. Prefix and Context Support
Add configurable prefixes:
- Static prefixes (e.g., "Results:", "Output:")
- Dynamic prefixes based on execution context
- Timestamp support
- Command/operation context

### 3. Smart Data Type Handling
Automatic format detection based on data type:
- Arrays → Table format
- Objects → Table format (if structured) or JSON
- Strings → Generic format
- Numbers → Generic format with formatting

### 4. Conditional Logging
Support for:
- Empty result handling
- Error state logging
- Verbose vs quiet modes
- Filtered output

### 5. Extensibility
Plugin system for:
- Custom formatters
- Output transformers
- Logging hooks
- Styling themes

## Enhanced LogResult Design

### Enhanced Interface
```typescript
export type LogFormat = 'generic' | 'table' | 'json' | 'custom';

export interface LogResultConfig {
  resultKey: string;
  format?: LogFormat;
  prefix?: string;
  emptyMessage?: string;
  includeTimestamp?: boolean;
  customFormatter?: (data: any, context: LogContext) => string;
  verbose?: boolean;
  style?: LogStyle;
}

export interface LogContext {
  timestamp: Date;
  command?: string;
  operation?: string;
  metadata?: Record<string, any>;
}
```

### Enhanced Implementation
```typescript
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
      style: 'default',
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
      return timestamp + 'Results displayed as table';
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
```

## Migration Strategy

### Phase 1: Backward Compatibility
1. Keep existing `LogResult` class
2. Create `EnhancedLogResult` alongside it
3. Update `handleFlowRun()` to use enhanced version optionally

### Phase 2: Gradual Migration
1. Update specific commands to use enhanced features
2. Create convenience factory functions
3. Add configuration support in CLI options

### Phase 3: Consolidation
1. Deprecate old `LogResult`
2. Update all commands to use enhanced version
3. Remove legacy implementation

## Usage Examples

### Enhanced Flow Run
```typescript
// Current: new LogResult("results")
// Enhanced:
const logResults = new EnhancedLogResult({
  resultKey: "results",
  format: "table", // Auto-detect table format for arrays/objects
  prefix: "Flow execution results:",
  includeTimestamp: true,
  verbose: opts.verbose
});
```

### Config List with Enhanced Logging
```typescript
// Instead of: console.table(shared.configValues);
// Use:
const logConfig = new EnhancedLogResult({
  resultKey: "configValues",
  format: "table",
  prefix: "Configuration entries:",
  emptyMessage: "No configuration entries found."
});
```

### Trace Show with JSON Formatting
```typescript
// Instead of: console.log(JSON.stringify(shared.traceData, null, 2));
// Use:
const logTrace = new EnhancedLogResult({
  resultKey: "traceData",
  format: "json",
  prefix: "Trace data:",
  includeTimestamp: true
});
```

### Custom Formatting
```typescript
const logCustom = new EnhancedLogResult({
  resultKey: "customData",
  format: "custom",
  customFormatter: (data, context) => {
    return `📊 ${context.command} Results:\n${JSON.stringify(data, null, 2)}`;
  }
});
```

## Benefits of Enhanced Implementation

1. **Consistency**: Standardized logging across all CLI commands
2. **Flexibility**: Support for various output formats and styles
3. **Maintainability**: Centralized logging logic reduces code duplication
4. **User Experience**: Better formatted, more informative output
5. **Extensibility**: Easy to add new formats and features
6. **Testing**: Easier to test logging behavior with configurable options

## Implementation Plan

### Step 1: Create Enhanced LogResult Class
- Implement the enhanced `LogResult` class with all features
- Add comprehensive TypeScript types
- Include unit tests for all formatting options

### Step 2: Update Flow Commands
- Update `handleFlowRun()` to use enhanced logging
- Add configuration options for flow-specific formatting
- Test backward compatibility

### Step 3: Migrate Other Commands
- Update `config.ts` commands to use enhanced logging
- Update `trace.ts` commands to use enhanced logging
- Remove direct `console.log`/`console.table` usage

### Step 4: Add Configuration Support
- Add logging format options to CLI configuration
- Support global and per-command logging settings
- Add verbose mode support

### Step 5: Documentation and Testing
- Update documentation with new logging options
- Create comprehensive test suite
- Add examples to README

## Current Status
The current `LogResult` implementation is functional but limited. The enhanced version will provide flexible, configurable logging that can adapt to different data types and user preferences while maintaining backward compatibility.

**Ready to implement the enhanced LogResult solution!** 🔄