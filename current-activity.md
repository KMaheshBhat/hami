# HAMI Project: Migration from OpNode to PocketFlow

## Background
The old HAMI project used an OpNode-based system where operations were defined as individual nodes with providers that handled execution. The new project is being rewritten using PocketFlow, a TypeScript port of the Python PocketFlow framework.

## Analysis of Old System

### OpNode System Architecture
From the provided code, the old system had:

1. **Core Types** (`types.ts`):
   - `OpNode`: Basic operation node with name, kind, description, and config
   - `OpNodeProvider`: Blueprint for creating OpNodes with execution logic
   - `OpNodeInput/Output`: Standardized input/output interfaces
   - Validation schemas and factory functions

2. **Registration System** (`registration.ts`):
   - `DynamicRegistrationManager`: Central registry for OpNode providers
   - Plugin system for dynamic loading of providers
   - Event-driven registration with lifecycle hooks
   - Support for categories and metadata

### Key Features of Old System:
- **Provider Registration**: Providers registered via `DynamicRegistrationManager`
- **Plugin Architecture**: Extensible plugin system with initialization/cleanup
- **Validation**: Schema-based validation for configs and payloads
- **Categories**: Hierarchical organization (e.g., `copy:file`, `ollama:chat`)
- **Lifecycle Hooks**: Before/after registration events
- **Dynamic Loading**: Support for loading plugins from URLs

## New PocketFlow Integration

### Current State
The new project has significant progress on PocketFlow integration:
- `HAMINode` abstract class extends PocketFlow's `Node` with configuration and validation
- `HAMIFlow` abstract class extends PocketFlow's `Flow` with configuration and validation
- Two concrete nodes implemented: `CoreFSCopyNode` and `InitWorkingDirectoryNode`
- Schema-based validation system with `ValidationSchema` and `validateAgainstSchema`
- Nodes are configurable and validated at construction time
- No plugin registration system yet (this is the pending work)

### PocketFlow Concepts
PocketFlow provides:
- **Flows**: Composable workflows of nodes
- **Nodes**: Individual processing units
- **Agents**: AI-powered nodes with reasoning capabilities
- **Multi-agent systems**: Coordination between multiple agents

## High-Level Approach for Provider Registration

### 1. HAMINode as Abstract Provider
HAMINode is already the provider contract with configuration and validation:

```typescript
abstract class HAMINode<S = unknown, C = unknown> extends Node<S> {
  protected config: C | undefined = undefined;

  constructor(config: C | undefined = undefined, maxRetries: number = 1, wait: number = 0) {
    super(maxRetries, wait);
    this.config = config;
    if (!config) return;
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid configuration for HAMINode ${this.kind()}`);
    }
  }

  abstract kind(): string;
  validateConfig(_config: C): HAMINodeConfigValidateResult;
}
```

### 2. Registration Manager Adaptation
Registration manager works with HAMINode classes:

```typescript
class HAMIRegistrationManager {
  private nodeClasses = new Map<string, typeof HAMINode>();

  registerNodeClass(nodeClass: typeof HAMINode): void;
  getNodeClass(kind: string): typeof HAMINode | undefined;
  createNode(kind: string, config: NodeConfig): HAMINode;
  getAllNodeClasses(): (typeof HAMINode)[];
  getFlowNodeClasses(): (typeof HAMINode)[];
  getBasicNodeClasses(): (typeof HAMINode)[];
}
```

### 3. Plugin System Integration
Plugins provide HAMINode classes directly:

```typescript
interface HAMIPlugin {
  name: string;
  version: string;
  initialize(): Promise<void>;
  getNodeClasses(): (typeof HAMINode)[];
  destroy?(): Promise<void>;
}
```

### 4. Factory Pattern
Factory functions create HAMINode subclasses:

```typescript
function createHAMINodeClass(config: HAMINodeConfig): typeof HAMINode;
function createHAMIFlowClass(config: HAMIFlowConfig): typeof HAMIFlow;
```

### 5. Category Organization
Maintain hierarchical organization:
- `flow:llm:chat` - LLM chat flow
- `node:fs:copy` - File system copy node
- `node:ai:reasoning` - AI reasoning node

## Implementation Plan

### Phase 1: Core Types and Interfaces ✅ COMPLETED
1. HAMINode abstract class with configuration and validation ✅
2. HAMIFlow abstract class with configuration and validation ✅
3. Validation schemas and validateAgainstSchema function ✅
4. Two concrete nodes: CoreFSCopyNode and InitWorkingDirectoryNode ✅

### Phase 2: Plugin Management System ⏳ PENDING (Current Focus)
1. Create `HAMIRegistrationManager` class
2. Implement registration methods for HAMINode classes
3. Add category-based querying and organization
4. Support flow vs node distinction via static properties

### Phase 3: Plugin Architecture ⏳ PENDING
1. Define `HAMIPlugin` interface
2. Implement plugin loading and initialization
3. Add lifecycle management for plugins

### Phase 4: Integration with PocketFlow ⏳ PENDING
1. RegistrationManager creates HAMINode instances from registered classes
2. Create flow composition utilities using HAMINode classes
3. Add validation and error handling

### Phase 5: Testing and Documentation ⏳ PENDING
1. Create comprehensive tests for provider registration
2. Document provider creation patterns and best practices
3. Add examples and usage guides

## Benefits of This Approach

1. **Unified Architecture**: Single provider type aligns with PocketFlow's Flow=Node concept
2. **Familiarity**: Maintains similar patterns to old system
3. **Extensibility**: Plugin architecture allows easy addition of new providers
4. **Type Safety**: Strong typing with validation schemas
5. **Organization**: Hierarchical categories for better discoverability
6. **Lifecycle Management**: Proper initialization and cleanup of providers
7. **PocketFlow Integration**: Seamless integration with framework capabilities
8. **Simplified API**: Single registration interface reduces complexity

## Revised Architecture: HAMINode as Provider

### Understanding the Original Intent
The `HAMINode` was designed as a decorator for PocketFlow's base `Node` class to add "provider" features for use in a PluginRegistry. This suggests the original design intended HAMINode to be self-registering.

### Counterpoint Analysis
Given that HAMINode was meant to be the provider, we should reconsider the architecture:

#### Revised Pros:
1. **Original Design Intent**: HAMINode was specifically created to be the provider abstraction
2. **Framework Integration**: Decorates PocketFlow's Node with registration capabilities
3. **Unified Abstraction**: Single class handles both node behavior and provider contract
4. **Plugin Registry Fit**: Designed specifically for plugin-based registration

#### Revised Cons (Mitigated):
1. **Tight Coupling**: Actually intended - HAMINode is the provider by design
2. **Inheritance**: TypeScript abstract classes work well for this pattern
3. **Testing**: Can still test node logic separately, factory methods can be static
4. **Flexibility**: Abstract class allows extension while enforcing contracts

#### New Architecture:
```
HAMINode (abstract class)
├── kind(): string (from PocketFlow Node)
├── create(config): HAMINode (static factory)
├── validateConfig(config): ValidationResult (static)
└── Registration metadata (description, etc.)
```

### Implementation Approach
1. Convert `HAMINode` to abstract class with provider contract
2. Add static factory methods and validation
3. RegistrationManager works directly with HAMINode classes
4. Plugins provide HAMINode subclasses

### Benefits of This Approach
- **Faithful to Original Design**: Respects the initial HAMINode purpose
- **Clean Plugin Architecture**: Plugins provide node classes directly
- **TypeScript Best Practices**: Abstract classes provide good structure
- **PocketFlow Integration**: Natural extension of the framework

## Next Steps

1. ✅ **Phase 1 Complete**: HAMINode/HAMIFlow abstractions with validation
2. ⏳ **Phase 2 Current**: Implement plugin management system (PocketFlowRegistrationManager)
3. ⏳ **Phase 3 Pending**: Plugin architecture and loading
4. ⏳ **Phase 4 Pending**: PocketFlow integration utilities
5. ⏳ **Phase 5 Pending**: Testing and documentation

**Current Focus**: Plugin management system - the HAMIRegistrationManager that will allow dynamic loading and instantiation of HAMINode classes. Only HAMI-wrapped nodes/flows with `kind()` methods can be registered, not native PocketFlow nodes.