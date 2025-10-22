# @hami-frameworx/core-config-fs

[![npm version](https://badge.fury.io/js/%40hami-frameworx%2Fcore-config-fs.svg)](https://badge.fury.io/js/%40hami-frameworx%2Fcore-config-fs)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The core configuration file system package for HAMI (Human Agent Machine Interface) - providing essential configuration management operations for building agentic applications.

## Features

- **Configuration Management**: Complete set of config operations for local and global scopes
- **Hierarchical Config**: Support for local (project) and global (user) configuration files
- **Config Merging**: Automatic fallback from local to global config with override capability
- **Type-Safe**: Built-in validation and TypeScript support
- **File-Based Storage**: JSON-based configuration files stored in .hami directories

## Installation

```bash
npm install @hami-frameworx/core-config-fs
```

## Quick Start

```typescript
import { hamiRegistrationManager, CoreConfigFSPlugin } from '@hami-frameworx/core-config-fs';
import { HAMIFlow } from '@hami-frameworx/core';

// Register the core-config-fs plugin
await hamiRegistrationManager.registerPlugin(CoreConfigFSPlugin);

// Create a flow that gets configuration values
class ConfigFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:config-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // Get a specific config value
    const getNode = hamiRegistrationManager.createNode('core-config-fs:get', {
      target: 'local-and-global'
    });

    this.startNode.next(getNode);
    return super.run(shared);
  }
}

// Run the flow
const flow = new ConfigFlow();
await flow.run({ configKey: 'mySetting' });
```

## Core Nodes

This package provides the following configuration node types:

- **`core-config-fs:get`**: Retrieves a specific configuration value by key
- **`core-config-fs:get-all`**: Retrieves all configuration values from local, global, or merged sources
- **`core-config-fs:set`**: Sets a configuration value by key in local or global config
- **`core-config-fs:remove`**: Removes a configuration value by key from local or global config

## Basic Usage

### Getting Configuration Values

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

// Create a flow for getting config values
class GetConfigFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:get-config-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // Get a specific config value with fallback to global
    const getNode = hamiRegistrationManager.createNode('core-config-fs:get', {
      target: 'local-and-global'
    });

    this.startNode.next(getNode);
    return super.run(shared);
  }
}

const getFlow = new GetConfigFlow();
await getFlow.run({ configKey: 'database.url' });

// Access the result
console.log(shared.configValue);
```

### Setting Configuration Values

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

// Create a flow for setting config values
class SetConfigFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:set-config-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // Set a config value in local scope
    const setNode = hamiRegistrationManager.createNode('core-config-fs:set', {
      target: 'local'
    });

    this.startNode.next(setNode);
    return super.run(shared);
  }
}

const setFlow = new SetConfigFlow();
await setFlow.run({
  configKey: 'api.endpoint',
  configValue: 'https://api.example.com'
});
```

### Listing All Configuration

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

// Create a flow for listing all config
class ListConfigFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:list-config-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // Get all config values (merged local + global)
    const getAllNode = hamiRegistrationManager.createNode('core-config-fs:get-all', {
      target: 'local-and-global'
    });

    this.startNode.next(getAllNode);
    return super.run(shared);
  }
}

const listFlow = new ListConfigFlow();
await listFlow.run({});

// Access all config values
console.log(shared.configValues);
```

### Removing Configuration Values

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

// Create a flow for removing config values
class RemoveConfigFlow extends HAMIFlow<Record<string, any>> {
  constructor() {
    const initNode = hamiRegistrationManager.createNode('core-fs:init-hami', {
      strategy: 'CWD'
    });
    super(initNode);
  }

  kind(): string {
    return 'example:remove-config-flow';
  }

  async run(shared: Record<string, any>): Promise<string | undefined> {
    // Remove a config value from global scope
    const removeNode = hamiRegistrationManager.createNode('core-config-fs:remove', {
      target: 'global'
    });

    this.startNode.next(removeNode);
    return super.run(shared);
  }
}

const removeFlow = new RemoveConfigFlow();
await removeFlow.run({ configKey: 'deprecated.setting' });
```

## Configuration Scopes

The core-config-fs package supports three configuration scopes:

- **`local`**: Project-specific configuration stored in `./.hami/config.json`
- **`global`**: User-wide configuration stored in `~/.hami/config.json`
- **`local-and-global`**: Merged configuration where local values override global ones

## Shared State Interface

The core-config-fs package uses a comprehensive shared state interface for passing data between operations:

```typescript
interface CoreConfigFSStorage {
  // Configuration
  opts?: { verbose?: boolean };
  target: 'global' | 'local' | null;
  useGlobalFallback?: boolean;

  // Directory paths
  hamiDirectory?: string;
  userHamiDirectory?: string;

  // Config operations
  configKey?: string;
  configValue?: any;
  configValues?: Record<string, any>;
  configValuePrevious?: any;
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
- [NPM Package](https://www.npmjs.com/package/@hami-frameworx/core-config-fs)
- [Issues](https://github.com/KMaheshBhat/hami/issues)