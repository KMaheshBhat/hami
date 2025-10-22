# @hami-frameworx/core

[![npm version](https://badge.fury.io/js/%40hami-frameworx%2Fcore.svg)](https://badge.fury.io/js/%40hami-frameworx%2Fcore)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The core package for HAMI (Human Agent Machine Interface) - a modular, plugin-based workflow system for building agentic applications.

## Features

- **Plugin Architecture**: Extensible node-based system with plugin support
- **Type-Safe Configuration**: Built-in validation for node and flow configurations
- **Core Operations**: Essential nodes for logging, data mapping, and dynamic execution
- **Flow Composition**: Build complex workflows from reusable components
- **Event-Driven**: Registration lifecycle with hooks for customization

## Installation

```bash
npm install @hami-frameworx/core
```

## Quick Start

```typescript
import { hamiRegistrationManager, CorePlugin } from '@hami-frameworx/core';

// Register the core plugin
await hamiRegistrationManager.registerPlugin(CorePlugin);

// Create and run a debug node
const debugNode = hamiRegistrationManager.createNode('core:debug');
await debugNode.run({ message: 'Hello HAMI!' });
```

## Core Nodes

This package provides the following core node types:

- **`core:debug`**: Logs the entire shared state for debugging
- **`core:log-result`**: Logs result data with various formatting options (table, JSON, generic)
- **`core:log-error`**: Logs error information from shared state
- **`core:map`**: Maps properties from shared state using dot-notation paths
- **`core:dynamic-runner`**: Dynamically creates and runs nodes based on configuration
- **`core:dynamic-runner-flow`**: Flow wrapper for dynamic node execution

## Basic Usage

### Creating a Custom Node

```typescript
import { HAMINode, HAMINodeConfigValidateResult } from '@hami-frameworx/core';

interface MyNodeConfig {
  inputKey: string;
  multiplier: number;
}

class MyMultiplierNode extends HAMINode<Record<string, any>, MyNodeConfig> {
  kind(): string {
    return 'example:multiplier';
  }

  validateConfig(config: MyNodeConfig): HAMINodeConfigValidateResult {
    if (config.multiplier < 0) {
      return { valid: false, errors: ['Multiplier must be non-negative'] };
    }
    return { valid: true, errors: [] };
  }

  async prep(shared: Record<string, any>): Promise<number> {
    return shared[this.config!.inputKey] || 0;
  }

  async exec(prepRes: number): Promise<void> {
    const result = prepRes * this.config!.multiplier;
    shared.result = result;
  }
}
```

### Creating a Flow

```typescript
import { HAMIFlow } from '@hami-frameworx/core';

class MyFlow extends HAMIFlow<Record<string, any>, { inputKey: string }> {
  constructor(config: { inputKey: string }) {
    const multiplierNode = new MyMultiplierNode({
      inputKey: config.inputKey,
      multiplier: 2
    });
    super(multiplierNode, config);
  }

  kind(): string {
    return 'example:my-flow';
  }
}
```

### Plugin Development

```typescript
import { createPlugin } from '@hami-frameworx/core';

const myPlugin = createPlugin(
  "@my-org/custom-nodes",
  "1.0.0",
  [MyMultiplierNode, MyFlow],
  "Custom nodes for mathematical operations"
);

// Register the plugin
await hamiRegistrationManager.registerPlugin(myPlugin);
```

## API Reference

For detailed API documentation, see the [TypeScript definitions](./src/types.ts) and [source code](https://github.com/KMaheshBhat/hami).

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/KMaheshBhat/hami) for contribution guidelines.

## License

MIT © [Mahesh K Bhat](https://github.com/KMaheshBhat)

## Links

- [GitHub Repository](https://github.com/KMaheshBhat/hami)
- [NPM Package](https://www.npmjs.com/package/@hami-frameworx/core)
- [Issues](https://github.com/KMaheshBhat/hami/issues)