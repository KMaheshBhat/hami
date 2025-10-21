# HAMI (Human Agent Machine Interface)

A modular, plugin-based framework for building human-agent workflows and machine interfaces using TypeScript.

## Overview

HAMI is a monorepo containing a core framework and applications for creating extensible workflows that bridge human interaction with machine execution. It provides a plugin architecture for dynamically registering custom nodes and flows, with built-in support for file system operations, configuration management, and tracing.

HAMI builds on top of [PocketFlow](https://github.com/The-Pocket/PocketFlow-Typescript), a lightweight TypeScript framework for creating expressive workflows and agent systems. PocketFlow provides the core workflow execution engine with support for multi-agent systems, RAG patterns, and agentic coding workflows, while HAMI extends it with a plugin system, CLI tools, and specialized components for human-agent interactions.

## Architecture

### Core Components

- **@hami/core**: Core library providing the fundamental types, registration system, and base classes ([`core/spec.md`](openspec/specs/core/spec.md))
- **@hami/core-fs**: File system operations plugin ([`core-fs/spec.md`](openspec/specs/core-fs/spec.md))
- **@hami/core-config-fs**: Configuration management using file system storage ([`core-config-fs/spec.md`](openspec/specs/core-config-fs/spec.md))
- **@hami/core-trace-fs**: Operation tracing and logging plugin ([`core-trace-fs/spec.md`](openspec/specs/core-trace-fs/spec.md))
- **@hami/hami-cli**: Command-line interface for managing HAMI workflows ([`hami-cli/spec.md`](openspec/specs/hami-cli/spec.md))
- **@hami/hami-server**: HTTP server for programmatic access to HAMI functionality ([`hami-server/spec.md`](openspec/specs/hami-server/spec.md))

### Key Concepts

#### HAMINode
Abstract base class for workflow nodes that perform specific operations. Nodes can:
- Validate configuration
- Prepare execution context
- Execute operations
- Handle post-execution logic

#### HAMIFlow
Abstract base class for complete workflows composed of connected nodes.

#### Plugin System
Extensible plugin architecture allowing registration of custom nodes and flows through the `HAMIRegistrationManager`.

## Installation

### Prerequisites
- Node.js 18+
- Bun runtime (recommended)

### Setup
```bash
# Clone the repository
git clone https://github.com/KMaheshBhat/hami.git
cd hami

# Install dependencies
bun install

# Build all packages
bun run all:build

# Install CLI globally
bun run cli:install
```

## Usage

### CLI

The HAMI CLI provides commands for managing workflows, configuration, and tracing. See [`hami-cli/spec.md`](openspec/specs/hami-cli/spec.md) for detailed command requirements and scenarios.

#### Initialize a HAMI project
```bash
hami init
```

#### Configuration Management
```bash
# List all configuration
hami config list

# Set a configuration value
hami config set key value

# Get a configuration value
hami config get key

# Remove a configuration key
hami config remove key
```

#### Flow Management
```bash
# Initialize a new flow
hami flow init copy-markdown core-fs:copy '{"sourcePattern": "*.md", "targetDirectory": "./md-backup"}' copyResults

# Run a flow
hami flow run copy-markdown

# List all flows
hami flow list

# Remove a flow
hami flow remove copy-markdown
```

#### Tracing Operations
```bash
# List all traces
hami trace list

# Show details of a specific trace
hami trace show <trace-id>

# Search traces
hami trace grep "search query"
```

*Note: Traces are identified using unique UUIDv7 identifiers for temporal ordering and efficient indexing.*

### Server

The HAMI server provides a RESTful HTTP API for programmatic access, built with the Hono framework and structured for future API expansion. See [`hami-server/spec.md`](openspec/specs/hami-server/spec.md) for detailed API requirements and endpoint specifications.

```bash
# Start the development server
bun run server:dev
```

#### Endpoints
- `GET /` - Server status
- `GET /health` - Health check

## Development

### Project Structure
```
hami/
├── apps/
│   ├── hami-cli/          # CLI application
│   └── hami-server/       # HTTP server
├── packages/
│   ├── core/              # Core framework
│   ├── core-config-fs/    # Config plugin
│   ├── core-fs/           # File system plugin
│   └── core-trace-fs/     # Tracing plugin
├── package.json
└── README.md
```

### Building
```bash
# Build all packages
bun run all:build

# Clean build artifacts
bun run all:clean
```

### Creating Plugins
Plugins are created using the `createPlugin` helper function:

```typescript
import { createPlugin, HAMINode } from '@hami/core';

class MyCustomNode extends HAMINode {
  kind() { return 'my:custom'; }
  // ... implementation
}

const MyPlugin = createPlugin(
  'my-plugin',
  '1.0.0',
  [MyCustomNode],
  'My custom plugin description'
);
```

## Specifications

For detailed technical specifications of each component, see the [`openspec/specs/`](openspec/specs/) directory:
- [`core/spec.md`](openspec/specs/core/spec.md) - Core plugin system architecture
- [`core-fs/spec.md`](openspec/specs/core-fs/spec.md) - File system operations
- [`core-config-fs/spec.md`](openspec/specs/core-config-fs/spec.md) - Configuration management
- [`core-trace-fs/spec.md`](openspec/specs/core-trace-fs/spec.md) - Trace logging and retrieval
- [`hami-cli/spec.md`](openspec/specs/hami-cli/spec.md) - Command-line interface
- [`hami-server/spec.md`](openspec/specs/hami-server/spec.md) - HTTP API server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please open an issue on GitHub.