# @hami-frameworx/core-trace-fs

[![npm version](https://badge.fury.io/js/%40hami-frameworx%2Fcore-trace-fs.svg)](https://badge.fury.io/js/%40hami-frameworx%2Fcore-trace-fs)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The core trace file system package for HAMI (Human Agent Machine Interface) - providing essential trace logging and retrieval operations for building agentic applications.

## Features

- **Trace Logging**: Complete set of operations for logging workflow execution traces
- **Trace Retrieval**: Efficient querying and retrieval of stored trace data
- **Unique Trace IDs**: Automatic generation of unique identifiers for each trace
- **Timestamp Tracking**: Automatic timestamp recording for all trace entries
- **Text Search**: Full-text search capabilities across trace data
- **File-Based Storage**: JSON-based trace storage in .hami directories
- **Type-Safe**: Built-in validation and TypeScript support

## Installation

```bash
npm install @hami-frameworx/core-trace-fs
```

## Quick Start

```typescript
import { hamiRegistrationManager, CoreTraceFSPlugin } from '@hami-frameworx/core-trace-fs';
import { HAMIFlow } from '@hami-frameworx/core';

// Register the core-trace-fs plugin
await hamiRegistrationManager.registerPlugin(CoreTraceFSPlugin);

// Create a flow that logs trace data
class TraceFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:trace-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // Inject trace data
    const injectNode = hamiRegistrationManager.createNode('core-trace-fs:inject', {});
    // Log the trace
    const logNode = hamiRegistrationManager.createNode('core-trace-fs:log', {});

    this.startNode.next(injectNode).next(logNode);
    return super.run(shared);
  }
}

// Run the flow with trace data
const flow = new TraceFlow();
await flow.run({
  traceData: {
    operation: 'user_login',
    userId: '12345',
    timestamp: new Date().toISOString()
  }
});
```

## Core Nodes

This package provides the following trace node types:

- **`core-trace-fs:inject`**: Injects trace data into the workflow for logging
- **`core-trace-fs:log`**: Logs trace data with timestamp and unique ID to the file system
- **`core-trace-fs:list`**: Lists all trace entries with their IDs and timestamps
- **`core-trace-fs:show`**: Retrieves a specific trace entry by its unique ID
- **`core-trace-fs:grep`**: Searches trace entries using text-based queries

## Basic Usage

### Logging Trace Data

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

// Create a flow for logging traces
class LogTraceFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:log-trace-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // Inject trace data
    const injectNode = hamiRegistrationManager.createNode('core-trace-fs:inject', {});
    // Log the trace to file system
    const logNode = hamiRegistrationManager.createNode('core-trace-fs:log', {});

    this.startNode.next(injectNode).next(logNode);
    return super.run(shared);
  }
}

const logFlow = new LogTraceFlow();
await logFlow.run({
  traceData: {
    event: 'api_call',
    endpoint: '/users/profile',
    method: 'GET',
    responseTime: 150
  }
});

// Access the generated trace ID
console.log(shared.traceId);
```

### Listing Trace Entries

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

// Create a flow for listing traces
class ListTracesFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:list-traces-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // List all trace entries
    const listNode = hamiRegistrationManager.createNode('core-trace-fs:list', {});

    this.startNode.next(listNode);
    return super.run(shared);
  }
}

const listFlow = new ListTracesFlow();
await listFlow.run({});

// Access the trace results
console.log(shared.traceResults);
// Output: [{ id: '01HQ...', timestamp: '2024-...' }, ...]
```

### Retrieving Specific Traces

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

// Create a flow for showing a specific trace
class ShowTraceFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:show-trace-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // Retrieve a specific trace by ID
    const showNode = hamiRegistrationManager.createNode('core-trace-fs:show', {});

    this.startNode.next(showNode);
    return super.run(shared);
  }
}

const showFlow = new ShowTraceFlow();
await showFlow.run({ traceId: '01HQ...' });

// Access the complete trace data
console.log(shared.traceData);
// Output: { id: '01HQ...', timestamp: '2024-...', data: {...} }
```

### Searching Traces

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

// Create a flow for searching traces
class SearchTracesFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:search-traces-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // Search traces containing specific text
    const grepNode = hamiRegistrationManager.createNode('core-trace-fs:grep', {});

    this.startNode.next(grepNode);
    return super.run(shared);
  }
}

const searchFlow = new SearchTracesFlow();
await searchFlow.run({ searchQuery: 'api_call' });

// Access the search results
console.log(shared.traceResults);
// Output: [{ id: '01HQ...', timestamp: '2024-...', data: {...} }, ...]
```

## Trace Storage Format

Traces are stored in JSON format in the `.hami/wf.index.json` file with the following structure:

```json
[
  {
    "id": "01HQXXXXXXXXXXXXXXXXXXXXX",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "data": {
      "event": "user_action",
      "userId": "12345",
      "action": "login"
    }
  }
]
```

## Shared State Interface

The core-trace-fs package uses a comprehensive shared state interface for passing data between operations:

```typescript
interface CoreTraceFSStorage {
  // Configuration
  opts?: { verbose?: boolean };

  // Directory paths
  hamiDirectory?: string;

  // Trace operations
  traceIndex?: Record<string, any>[];
  traceId?: string;
  traceData?: Record<string, any>;
  traceResults?: Record<string, any>[];
  searchQuery?: string;
}
```

## Dependencies

- `@hami-frameworx/core`: Core HAMI framework

## API Reference

For detailed API documentation, see the [TypeScript definitions](./src/types.ts) and [source code](https://github.com/KMaheshBhat/hami).

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/KMaheshBhat/hami) for contribution guidelines.

## License

MIT © [Mahesh K Bhat](https://github.com/KMaheshBhat)

## Links

- [GitHub Repository](https://github.com/KMaheshBhat/hami)
- [NPM Package](https://www.npmjs.com/package/@hami-frameworx/core-trace-fs)
- [Issues](https://github.com/KMaheshBhat/hami/issues)