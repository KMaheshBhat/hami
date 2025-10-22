# @hami-frameworx/core-fs

[![npm version](https://badge.fury.io/js/%40hami-frameworx%2Fcore-fs.svg)](https://badge.fury.io/js/%40hami-frameworx%2Fcore-fs)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The core file system package for HAMI (Human Agent Machine Interface) - providing essential file system operations for building agentic applications.

## Features

- **File System Operations**: Complete set of file and directory operations
- **Directory Management**: Initialize and validate HAMI directory structures
- **File I/O**: Read and write files with encoding support
- **Bulk Operations**: Copy files using glob patterns
- **Directory Listing**: List directory contents with metadata
- **Type-Safe**: Built-in validation and TypeScript support

## Installation

```bash
npm install @hami-frameworx/core-fs
```

## Quick Start

```typescript
import { hamiRegistrationManager, CoreFSPlugin } from '@hami-frameworx/core-fs';
import { HAMIFlow } from '@hami-frameworx/core';

// Register the core-fs plugin
await hamiRegistrationManager.registerPlugin(CoreFSPlugin);

// Create a flow that initializes and lists directory contents
class FileSystemFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:filesystem-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    const listNode = hamiRegistrationManager.createNode('core-fs:list-directory', {
      path: '.',
      recursive: false
    });
    this.startNode.next(listNode);
    return super.run(shared);
  }
}

// Run the flow
const flow = new FileSystemFlow();
await flow.run({});
```

## Core Nodes

This package provides the following file system node types:

- **`core-fs:init-hami`**: Initializes working directory and creates .hami directories
- **`core-fs:validate-hami`**: Validates existence of required HAMI directories
- **`core-fs:list-directory`**: Lists directory contents with file metadata
- **`core-fs:read-file`**: Reads file contents with specified encoding
- **`core-fs:write-file`**: Writes content to files, creating directories as needed
- **`core-fs:copy`**: Copies files matching glob patterns to target directories

## Basic Usage

### Directory Initialization and Validation

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

// Create a flow for directory setup
class SetupFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:setup-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // Initialize directories
    const validateNode = hamiRegistrationManager.createNode('core-fs:validate-hami');
    this.startNode.next(validateNode);
    return super.run(shared);
  }
}

const setupFlow = new SetupFlow();
await setupFlow.run({});
```

### File Operations

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

// Create a flow for file operations
class FileOpsFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:file-ops-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // Read a file
    const readNode = hamiRegistrationManager.createNode('core-fs:read-file', {
      path: 'config.json',
      encoding: 'utf8'
    });

    // Write content to a file
    const writeNode = hamiRegistrationManager.createNode('core-fs:write-file', {
      path: 'output.txt'
    });

    this.startNode.next(readNode).next(writeNode);
    return super.run(shared);
  }
}

const fileOpsFlow = new FileOpsFlow();
await fileOpsFlow.run({ content: 'Hello World!' });
```

### Directory Listing

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

// Create a flow for directory listing
class ListFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:list-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // List directory contents
    const listNode = hamiRegistrationManager.createNode('core-fs:list-directory', {
      path: './src',
      recursive: true
    });

    this.startNode.next(listNode);
    return super.run(shared);
  }
}

const listFlow = new ListFlow();
await listFlow.run({});

// Access results from shared state
console.log(shared.listDirectoryItems);
```

### File Copying

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

// Create a flow for file copying
class CopyFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:copy-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // Copy files using glob patterns
    const copyNode = hamiRegistrationManager.createNode('core-fs:copy', {
      sourcePattern: '*.ts',
      targetDirectory: './dist'
    });

    this.startNode.next(copyNode);
    return super.run(shared);
  }
}

const copyFlow = new CopyFlow();
await copyFlow.run({});
```

## Shared State Interface

The core-fs package uses a comprehensive shared state interface for passing data between operations:

```typescript
interface CoreFSSharedStorage {
  // Configuration
  opts?: { verbose?: boolean };
  coreFSStrategy?: string;

  // Directory paths
  workingDirectory?: string;
  hamiDirectory?: string;
  userHomeDirectory?: string;
  userHamiDirectory?: string;

  // Validation
  directoryValidationErrors?: string[];

  // File operations
  content?: string;
  listDirectoryItems?: Array<{ name: string, path: string, type: 'file' | 'directory', size?: number, modified?: Date }>;
  copyResults?: string[];
  writeFileResult?: string;
}
```


## Dependencies

- `@hami-frameworx/core`: Core HAMI framework
- `glob`: File pattern matching

## API Reference

For detailed API documentation, see the [TypeScript definitions](./src/types.ts) and [source code](https://github.com/KMaheshBhat/hami).

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/KMaheshBhat/hami) for contribution guidelines.

## License

MIT © [Mahesh K Bhat](https://github.com/KMaheshBhat)

## Links

- [GitHub Repository](https://github.com/KMaheshBhat/hami)
- [NPM Package](https://www.npmjs.com/package/@hami-frameworx/core-fs)
- [Issues](https://github.com/KMaheshBhat/hami/issues)