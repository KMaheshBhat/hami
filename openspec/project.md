# Project Context

## Purpose
HAMI (Human Agent Machine Interface) is a modular, plugin-based framework for building human-agent workflows and machine interfaces using TypeScript. It provides a plugin architecture for registering custom nodes and flows, with built-in support for file system operations, configuration management, and tracing. HAMI builds on top of PocketFlow, extending it with a plugin system, CLI tools, and specialized components for human-agent interactions.

## Tech Stack
- **Runtime**: Node.js 18+, Bun (recommended)
- **Language**: TypeScript 5.x
- **Build Tool**: Bun (package manager and runtime)
- **CLI Framework**: Commander.js
- **HTTP Server**: Hono
- **Workflow Engine**: PocketFlow (core workflow execution)
- **Package Management**: Monorepo with workspaces
- **Module System**: ES modules

## Project Conventions

### Code Style
- **Language**: TypeScript with strict mode enabled
- **Module System**: ES modules (type: "module" in package.json)
- **Naming Conventions**:
  - Classes: PascalCase (e.g., HAMINode, HAMIFlow)
  - Functions/Methods: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Files: kebab-case.ts
  - Packages: @hami/namespace-kebab-case
- **Formatting**: Standard TypeScript formatting (no specific linter configured yet)
- **Imports**: Use relative imports for internal modules, absolute for external dependencies

### Architecture Patterns
- **Monorepo Structure**: Uses npm workspaces with apps/ and packages/ directories
- **Plugin Architecture**: Extensible plugin system using HAMIRegistrationManager for registering custom nodes and flows
- **Abstract Base Classes**: HAMINode and HAMIFlow as foundation for workflow components
- **Separation of Concerns**: Core framework (@hami/core) separate from specific implementations (fs, config, trace plugins)
- **CLI + Server Pattern**: Command-line interface for direct usage, HTTP server for programmatic access
- **Workflow Composition**: Nodes connected to form flows, executed via PocketFlow engine

### Testing Strategy
Testing strategy is currently TBD. No test files or testing framework configured yet. Future implementation should include:
- Unit tests for individual nodes and flows
- Integration tests for plugin interactions
- CLI command testing
- HTTP endpoint testing for server component

### Git Workflow
Git workflow is currently TBD. Recommended approach:
- **Branching Strategy**: Git Flow or GitHub Flow (main branch for releases, feature branches for development)
- **Commit Conventions**: Conventional commits (feat:, fix:, docs:, etc.)
- **Pull Requests**: Required for all changes, with code review
- **Releases**: Versioned releases with changelog

## Domain Context
HAMI operates in the domain of human-agent workflows and machine interfaces, where:
- **HAMINode**: Represents individual operations that can be composed into workflows
- **HAMIFlow**: Complete workflows composed of connected nodes
- **Plugin System**: Allows extending functionality through custom nodes and flows
- **Built-in Plugins**: Core functionality includes file system operations, configuration management, and tracing
- **CLI Interface**: Direct command-line access for workflow management
- **Server Interface**: HTTP API for programmatic integration
- **Workflow Execution**: Powered by PocketFlow for multi-agent systems and RAG patterns

## Important Constraints
- **Node.js Version**: Minimum Node.js 18+ required
- **Runtime**: Bun runtime recommended for development and building
- **Module System**: ES modules only (no CommonJS support)
- **TypeScript**: Strict mode enabled, full type safety required
- **Monorepo**: Uses npm workspaces, all packages must be compatible
- **Plugin Architecture**: All extensions must implement HAMINode or HAMIFlow interfaces

## External Dependencies
- **PocketFlow**: Core workflow execution engine (^1.0.4) - provides multi-agent systems, RAG patterns, and agentic coding workflows
- **Commander.js**: CLI framework (^12.0.0) - used in hami-cli for command parsing and help generation
- **Hono**: HTTP server framework (^4.0.0) - used in hami-server for API endpoints
- **TypeScript**: Type system and compiler (^5.9.3) - core language tooling
- **Node.js Types**: Type definitions for Node.js (^20.0.0) - runtime type support
