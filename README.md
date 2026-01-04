# HAMI (Human Agent Machine Interface)

A modular, plugin-based framework for building human-agent workflows and machine interfaces using TypeScript.

## Overview

HAMI is a monorepo containing a core framework and applications for creating extensible workflows that bridge human interaction with machine execution. It provides a plugin architecture for dynamically registering custom nodes and flows, with built-in support for file system operations, configuration management, and tracing.

HAMI builds on top of [PocketFlow](https://github.com/The-Pocket/PocketFlow-Typescript), a lightweight TypeScript framework for creating expressive workflows and agent systems. PocketFlow provides the core workflow execution engine with support for multi-agent systems, RAG patterns, and agentic coding workflows, while HAMI extends it with a plugin system, CLI tools, and specialized components for human-agent interactions.

## Architecture

### Core Components

- **@hami-frameworx/core**: Core library providing the fundamental types, registration system, and base classes for the plugin architecture
- **@hami-frameworx/core-fs**: File system operations plugin for reading, writing, copying, and listing files
- **@hami-frameworx/core-config-fs**: Configuration management using file system storage with hierarchical local/global settings
- **@hami-frameworx/core-trace-fs**: Operation tracing and logging plugin for workflow debugging and auditing
- **@hami-frameworx/hami-cli**: Command-line interface for managing HAMI workflows, configurations, and traces
- **@hami-frameworx/hami-server**: HTTP server for programmatic access to HAMI functionality via RESTful API

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
- Node.js 18+ (minimum version required)
- Bun runtime (recommended for development and building)
- TypeScript 5.x (for type checking and compilation)

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

The HAMI CLI provides commands for managing workflows, configuration, and tracing.

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

The HAMI server provides a RESTful HTTP API for programmatic access, built with the Hono framework and structured for future API expansion.

```bash
# Start the development server
bun run server:dev
```

#### Endpoints
- `GET /` - Server status
- `GET /health` - Health check

## Development

### Technology Stack
- **Runtime**: Node.js 18+ (minimum), Bun (recommended for development)
- **Language**: TypeScript 5.x with strict mode enabled
- **Build Tool**: Bun (package manager and runtime)
- **CLI Framework**: Commander.js (^12.0.0)
- **HTTP Server**: Hono (^4.0.0)
- **Workflow Engine**: PocketFlow (^1.0.4) - core execution engine
- **Package Management**: Monorepo with npm workspaces
- **Module System**: ES modules only (no CommonJS support)

### Code Conventions
- **Naming Conventions**:
  - Classes: PascalCase (e.g., `HAMINode`, `HAMIFlow`)
  - Functions/Methods: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Files: kebab-case.ts
  - Packages: @hami/namespace-kebab-case
- **Formatting**: Standard TypeScript formatting
- **Imports**: Relative imports for internal modules, absolute for external dependencies

### Architecture Patterns
- **Monorepo Structure**: Apps in `apps/`, packages in `packages/` using npm workspaces
- **Plugin Architecture**: Extensible system using `HAMIRegistrationManager` for dynamic node and flow registration
- **Abstract Base Classes**: `HAMINode` and `HAMIFlow` as foundations for workflow components
- **Separation of Concerns**: Core framework separate from implementation plugins
- **CLI + Server Pattern**: Command-line interface for direct use, HTTP server for programmatic access
- **Workflow Composition**: Nodes connected to form flows, executed via PocketFlow engine

### Testing Strategy
Testing is currently TBD. Future implementation will include:
- Unit tests for individual nodes and flows
- Integration tests for plugin interactions
- CLI command testing
- HTTP endpoint testing for the server component

### Git Workflow
Git workflow is currently TBD. Recommended approach:
- **Branching Strategy**: Git Flow or GitHub Flow (main for releases, feature branches for development)
- **Commit Conventions**: Conventional commits (feat:, fix:, docs:, etc.)
- **Pull Requests**: Required for all changes with code review
- **Releases**: Versioned releases with changelog

### Important Constraints
- **Node.js Version**: Minimum Node.js 18+ required
- **Runtime**: Bun recommended for development and building
- **Module System**: ES modules only
- **TypeScript**: Strict mode enabled with full type safety
- **Monorepo**: Uses npm workspaces, all packages must be compatible
- **Plugin Extensions**: Must implement `HAMINode` or `HAMIFlow` interfaces

### External Dependencies
- **PocketFlow** (^1.0.4): Core workflow execution engine for multi-agent systems and RAG patterns
- **Commander.js** (^12.0.0): CLI framework for command parsing and help generation
- **Hono** (^4.0.0): HTTP server framework for API endpoints
- **TypeScript** (^5.9.3): Type system and compiler
- **@types/node** (^20.0.0): Type definitions for Node.js runtime

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
import { createPlugin, HAMINode } from '@hami-frameworx/core';

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