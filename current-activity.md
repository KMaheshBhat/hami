# HAMI Project: Core Node Analysis & Refactoring

## Overview
**Context**: Analysis of CLI-specific Nodes in `apps/hami-cli/src/cmd/common.ts` to determine which should be moved to `packages/core` as reusable HAMINode/HAMIFlow components.

**Goal**: Extract truly generic, reusable patterns from CLI-specific code to core packages so they can be used by:
- Other core plugins
- Non-core plugins
- HAMI executors (apps)
- Any HAMI-based application

## Current CLI Nodes Analysis

### 1. EnhancedLogResult (formerly LogResult)
**Current Location**: `apps/hami-cli/src/cmd/common.ts`

**Dependencies**:
- ✅ **PocketFlow**: `Node` base class
- ✅ **No external plugins**: Only uses standard Node.js/console APIs
- ✅ **Runtime invariants**: Expects `shared[resultKey]` to exist (properly validated)

**Genericity Assessment**: ⭐⭐⭐⭐⭐ HIGHLY GENERIC
- **Universal utility**: Logging results is needed in virtually all CLI applications
- **No CLI-specific logic**: Pure data formatting and console output
- **Configurable**: Supports multiple formats (table, JSON, generic, custom)
- **Reusable**: Could be used by any HAMI application needing structured output

**Recommendation**: ✅ MOVE TO CORE as `core:log-result`

### 2. LogErrorNode
**Current Location**: `apps/hami-cli/src/cmd/common.ts`

**Dependencies**:
- ✅ **PocketFlow**: `Node` base class
- ✅ **No external plugins**: Only console output
- ✅ **Runtime invariants**: Expects `shared[errorKey]` to exist

**Genericity Assessment**: ⭐⭐⭐⭐⭐ HIGHLY GENERIC
- **Universal utility**: Error logging is fundamental to all applications
- **Simple and focused**: Single responsibility - log errors
- **Consistent with LogResult**: Same pattern, different data type
- **No CLI coupling**: Could be used in servers, CLIs, or any HAMI app

**Recommendation**: ✅ MOVE TO CORE as `core:log-error`

### 3. DynamicRunnerNode
**Current Location**: `apps/hami-cli/src/cmd/common.ts`

**Dependencies**:
- ✅ **PocketFlow**: `Node` base class
- ✅ **HAMI Core**: `shared.registry.createNode()` - requires HAMIRegistrationManager
- ✅ **Runtime invariants**: Expects `shared[nodeConfigKey]` with `{kind, config}` structure

**Genericity Assessment**: ⭐⭐⭐⭐⭐ HIGHLY GENERIC
- **Dynamic execution**: Enables runtime Node creation from configuration
- **Plugin system enabler**: Core to HAMI's extensibility
- **No CLI specifics**: Pure workflow orchestration
- **Widely reusable**: Any HAMI app needing dynamic workflows

**Recommendation**: ✅ MOVE TO CORE as `core:dynamic-runner`

### 4. DynamicRunnerFlow
**Current Location**: `apps/hami-cli/src/cmd/common.ts`

**Dependencies**:
- ✅ **PocketFlow**: `Flow` base class
- ✅ **HAMI Core**: `HAMIFlow` base class and validation
- ✅ **Internal**: Uses `DynamicRunnerNode` (proposed for core move)

**Genericity Assessment**: ⭐⭐⭐⭐⭐ HIGHLY GENERIC
- **Flow orchestration**: Manages dynamic Node execution sequences
- **Configuration-driven**: Accepts flow config with validation
- **No CLI coupling**: Pure workflow management
- **Essential pattern**: Dynamic flow execution is core HAMI functionality

**Recommendation**: ✅ MOVE TO CORE as `core:dynamic-runner-flow`

### 5. TransformTraceResultsNode (NEW)
**Current Location**: `apps/hami-cli/src/cmd/trace.ts`

**Dependencies**:
- ✅ **PocketFlow**: `Node` base class
- ✅ **No external plugins**: Pure data transformation
- ✅ **Runtime invariants**: Expects `shared.traceResults` array structure

**Genericity Assessment**: ⭐⭐⭐ LOW - TRACE SPECIFIC
- **Domain specific**: Only useful for trace data transformation
- **Hardcoded structure**: Assumes specific trace object shape
- **Limited reusability**: Only applicable to trace search results
- **Better as local**: Keep in CLI trace module

**Recommendation**: ❌ KEEP IN CLI - `apps/hami-cli/src/cmd/trace.ts`

### 6. FilterFlowsNode (NEW)
**Current Location**: `apps/hami-cli/src/cmd/flow.ts`

**Dependencies**:
- ✅ **PocketFlow**: `Node` base class
- ✅ **No external plugins**: Pure data filtering
- ✅ **Runtime invariants**: Expects `shared.configValues` object

**Genericity Assessment**: ⭐⭐⭐ MEDIUM - CONFIG SPECIFIC
- **Configuration filtering**: Filters config keys by prefix
- **Somewhat generic**: Key prefix filtering could be parameterized
- **Limited scope**: Primarily useful for flow configuration management
- **CLI-specific**: Tied to HAMI's config key naming conventions

**Recommendation**: ❌ KEEP IN CLI - `apps/hami-cli/src/cmd/flow.ts`

## Proposed Core Node Extraction

### New Core Nodes to Create

#### 1. `core:log-result` (EnhancedLogResult)
```typescript
// packages/core/src/nodes/log-result.ts
export class LogResultNode<S> extends HAMINode<S, LogResultConfig> {
  // Enhanced logging with table/JSON/generic/custom formats
  // Supports timestamps, prefixes, verbose mode, empty handling
}
```

#### 2. `core:log-error` (LogErrorNode)
```typescript
// packages/core/src/nodes/log-error.ts
export class LogErrorNode<S> extends HAMINode<S, LogErrorConfig> {
  // Simple error logging with optional formatting
}
```

#### 3. `core:dynamic-runner` (DynamicRunnerNode)
```typescript
// packages/core/src/nodes/dynamic-runner.ts
export class DynamicRunnerNode<S> extends HAMINode<S> {
  // Runtime Node creation from configuration
  // Requires HAMIRegistrationManager in shared context
}
```

#### 4. `core:dynamic-runner-flow` (DynamicRunnerFlow)
```typescript
// packages/core/src/nodes/dynamic-runner-flow.ts
export class DynamicRunnerFlow<S> extends HAMIFlow<S, DynamicRunnerFlowConfig> {
  // Orchestrates dynamic Node execution sequences
}
```

### Core Registration Updates
```typescript
// packages/core/src/registration.ts
export function registerCoreNodes(registry: HAMIRegistrationManager) {
  registry.registerNode('core:log-result', LogResultNode);
  registry.registerNode('core:log-error', LogErrorNode);
  registry.registerNode('core:dynamic-runner', DynamicRunnerNode);
  registry.registerFlow('core:dynamic-runner-flow', DynamicRunnerFlow);
}
```

## Benefits of Core Extraction

1. **Reusability**: Core nodes available to all HAMI applications and plugins
2. **Consistency**: Standardized logging and dynamic execution across ecosystem
3. **Maintainability**: Bug fixes and features benefit entire HAMI ecosystem
4. **Separation of Concerns**: CLI focuses on CLI logic, core provides primitives
5. **Ecosystem Growth**: Other apps can build on proven, tested components

## Implementation Plan

### Task 1: Create Core Node Files
- Create `packages/core/src/nodes/` directory
- Implement `LogResultNode` (enhanced logging with table/JSON/generic/custom formats)
- Implement `LogErrorNode` (simple error logging)
- Implement `DynamicRunnerNode` (runtime Node creation from configuration)
- Implement `DynamicRunnerFlow` (orchestrates dynamic Node execution sequences)

### Task 2: Update Core Registration
- Add node registrations to `packages/core/src/registration.ts`
- Register as: `core:log-result`, `core:log-error`, `core:dynamic-runner`, `core:dynamic-runner-flow`
- Update exports in `packages/core/src/index.ts`

### Task 3: Test Core Compilation
- Run `bun run build` in packages/core
- Verify all new nodes compile without errors
- Test basic node instantiation and functionality

### Task 4: Update CLI Imports
- Update `apps/hami-cli/src/cmd/common.ts` imports:
```typescript
// Remove local implementations
// import { EnhancedLogResult, LogErrorNode, DynamicRunnerNode, DynamicRunnerFlow } from './common';

// Add core imports
import { LogResultNode, LogErrorNode, DynamicRunnerNode, DynamicRunnerFlow } from '@hami/core';
```

### Task 5: Update CLI Node References
- Replace `new EnhancedLogResult(...)` with `new LogResultNode(...)`
- Replace `new LogErrorNode(...)` with core version
- Replace `new DynamicRunnerNode(...)` with core version
- Replace `new DynamicRunnerFlow(...)` with core version

### Task 6: Update Node Kind References
- Change hardcoded node kinds to use core kinds:
  - `"log-result"` → `"core:log-result"`
  - `"log-error"` → `"core:log-error"`
  - `"dynamic-runner"` → `"core:dynamic-runner"`
  - `"dynamic-runner-flow"` → `"core:dynamic-runner-flow"`

### Task 7: Test CLI Compilation and Functionality
- Run `bun all:build` to verify everything compiles
- Test all CLI commands to ensure functionality is preserved
- Verify logging output formats work correctly

### Task 8: Remove Local Implementations
- Delete `EnhancedLogResult`, `LogErrorNode`, `DynamicRunnerNode`, `DynamicRunnerFlow` from `apps/hami-cli/src/cmd/common.ts`
- Clean up any unused imports or types
- Final compilation and testing

## Testing Plan

### Manual Test Commands (Impacted Commands Only)

#### Flow Commands
```bash
# Flow Run - Normal mode
hami flow run <flow-name>

# Flow Run - Verbose mode
hami flow run <flow-name> --verbose

# Flow List - Normal mode
hami flow list

# Flow List - Verbose mode
hami flow list --verbose

# Flow List - Global scope
hami flow list --global

# Flow List - Global scope with verbose
hami flow list -g --verbose
```

#### Config Commands
```bash
# Config List - Normal mode
hami config list

# Config List - Verbose mode
hami config list --verbose

# Config List - Global scope
hami config list --global

# Config List - Global scope with verbose
hami config list -g --verbose

# Config Get - Existing key
hami config get op:apikey

# Config Get - Existing key with verbose
hami config get op:apikey --verbose

# Config Get - Non-existent key
hami config get nonexistent:key

# Config Get - Non-existent key with verbose
hami config get nonexistent:key --verbose
```

#### Trace Commands
```bash
# Trace List - Normal mode
hami trace list

# Trace List - Verbose mode
hami trace list --verbose

# Trace Show - Normal mode
hami trace show <trace-id>

# Trace Show - Verbose mode
hami trace show <trace-id> --verbose

# Trace Grep - With matches
hami trace grep "flow"

# Trace Grep - With matches and verbose
hami trace grep "flow" --verbose

# Trace Grep - No matches
hami trace grep "nonexistent"

# Trace Grep - No matches with verbose
hami trace grep "nonexistent" --verbose
```

#### Build Verification
```bash
# Build all packages
bun all:build && bun cli:install
```

### Test Scenarios to Cover
1. **Table formatting** - All list commands should show data in table format
2. **Verbose mode** - Should show "Results displayed as table" message only when enabled
3. **Empty results** - Commands with no data should show appropriate empty messages
4. **JSON formatting** - Trace show should display pretty-printed JSON
5. **Prefix display** - Each command should show appropriate prefixes
6. **Timestamp inclusion** - Flow run and trace show should include timestamps
7. **Global/Local separation** - Config commands should respect global flag

### Expected Behaviors
- **Normal mode**: Clean output with tables/JSON as appropriate
- **Verbose mode**: Additional logging context + "Results displayed as table" for table outputs
- **Empty results**: Empty tables (headers only) or appropriate "no data" messages
- **Error handling**: Proper error messages for invalid operations
