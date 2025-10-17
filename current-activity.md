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

#### 1. `core:log-result` (LogResultNode)
```typescript
// packages/core/src/ops/log-result.ts
export class LogResultNode extends HAMINode<Record<string, any>, LogResultConfig> {
  // Enhanced logging with table/JSON/generic/custom formats
  // Supports timestamps, prefixes, verbose mode, empty handling
}
```

#### 2. `core:log-error` (LogErrorNode)
```typescript
// packages/core/src/ops/log-error.ts
export class LogErrorNode extends HAMINode<Record<string, any>, LogErrorConfig> {
  // Simple error logging with optional formatting
}
```

#### 3. `core:dynamic-runner` (DynamicRunnerNode)
```typescript
// packages/core/src/ops/dynamic-runner.ts
export class DynamicRunnerNode extends HAMINode<Record<string, any>, DynamicRunnerConfig> {
  // Runtime Node creation from configuration
  // Requires HAMIRegistrationManager in shared context
}
```

#### 4. `core:dynamic-runner-flow` (DynamicRunnerFlow)
```typescript
// packages/core/src/ops/dynamic-runner-flow.ts
export class DynamicRunnerFlow extends HAMIFlow<Record<string, any>, DynamicRunnerFlowConfig> {
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

## Implementation Plan ✅ ALL TASKS COMPLETED

### Task 1: Create Core Node Files ✅ COMPLETED
- Created `packages/core/src/ops/` directory (standardized naming)
- Implemented `LogResultNode` (enhanced logging with table/JSON/generic/custom formats)
- Implemented `LogErrorNode` (simple error logging)
- Implemented `DynamicRunnerNode` (runtime Node creation from configuration)
- Implemented `DynamicRunnerFlow` (orchestrates dynamic Node execution sequences)

### Task 2: Update Core Registration ✅ COMPLETED
- Created `CorePlugin` class in `packages/core/src/plugin.ts` following established plugin pattern
- Uses `createPlugin` helper function like other core plugins (`CoreFSPlugin`, `CoreConfigFSPlugin`, etc.)
- Plugin provides: `core:log-result`, `core:log-error`, `core:dynamic-runner`, `core:dynamic-runner-flow`
- Exported `CorePlugin` instance from `packages/core/src/index.ts`
- Added `CorePlugin` to CLI bootstrap in `apps/hami-cli/src/bootstrap.ts`

### Task 3: Test Core Compilation ✅ COMPLETED
- Ran `bun all:build` successfully
- Verified all new nodes compile without errors
- Tested basic node instantiation and functionality

### Task 4: Update CLI Imports ✅ COMPLETED
- Updated `apps/hami-cli/src/cmd/common.ts` imports to use core nodes
- Added `LogResultNode` import for helper functions

### Task 5: Update CLI Node References ✅ COMPLETED
- Replaced all `new EnhancedLogResult(...)` with `registry.createNode("core:log-result", ...)`
- Replaced all `new LogErrorNode(...)` with `registry.createNode("core:log-error", ...)`
- Replaced `new DynamicRunnerFlow(...)` with `registry.createNode("core:dynamic-runner-flow", ...)`

### Task 6: Update Node Kind References ✅ COMPLETED
- Updated `DynamicRunnerFlow` kind to `"core:dynamic-runner-flow"`

### Task 7: Test CLI Compilation and Functionality ✅ COMPLETED
- Ran `bun all:build` successfully - everything compiles
- Ran `bun cli:install` successfully - CLI builds and installs
- All CLI commands should work with preserved functionality

### Task 8: Remove Local Implementations ✅ COMPLETED
- Deleted `EnhancedLogResult`, `LogErrorNode`, `DynamicRunnerNode`, `DynamicRunnerFlow` from `apps/hami-cli/src/cmd/common.ts`
- Cleaned up unused imports and types
- Updated all CLI command files to use core nodes via registry
- Final compilation and testing successful

## Testing Plan

### Manual Test Commands (Impacted Commands Only)

#### Flow Commands ✅ TESTED - PASSING
```bash
# Flow Run - Normal mode
hami flow run <flow-name>
# ✅ PASS: snapshot-markdown-f shows table with copied file paths

# Flow Run - Verbose mode
hami flow run <flow-name> --verbose
# ✅ PASS: Shows validation checks + "Fetched config value" + execution output + "Logged trace" + "No results found."

# Flow List - Normal mode
hami flow list
# ✅ PASS: Shows table with index (flow names), kind, config columns

# Flow List - Verbose mode
hami flow list --verbose
# ✅ PASS: Shows validation checks + "Fetched all config from local-and-global" + JSON + table + "Results displayed as table"

# Flow List - Global scope
hami flow list --global
# ✅ PASS: Shows empty table (no global flows)

# Flow List - Global scope with verbose
hami flow list -g --verbose
# ✅ PASS: Shows validation checks + "Fetched all config from global" + JSON + empty table + "Results displayed as table"
```

#### Config Commands ✅ TESTED - PASSING
```bash
# Config List - Normal mode
hami config list
# ✅ PASS: Shows table with index, kind, config, Values columns (local+global)

# Config List - Verbose mode
hami config list --verbose
# ✅ PASS: Shows validation checks + "Fetched all config from local-and-global" + JSON + table + "Results displayed as table"

# Config List - Global scope
hami config list --global
# ✅ PASS: Shows table with only global config (op:apikey, op:url, gemini:apikey)

# Config List - Global scope with verbose
hami config list -g --verbose
# ✅ PASS: Shows validation checks + "Fetched all config from global" + JSON + table + "Results displayed as table"

# Config Get - Existing key
hami config get op:apikey
# ✅ PASS: Shows "Configuration value: <value>"

# Config Get - Existing key with verbose
hami config get op:apikey --verbose
# ✅ PASS: Shows validation checks + "Fetched config value for key 'op:apikey' from undefined" + value

# Config Get - Non-existent key
hami config get nonexistent:key
# ✅ PASS: Shows no output (empty result)

# Config Get - Non-existent key with verbose
hami config get nonexistent:key --verbose
# ✅ PASS: Shows validation checks + "Fetched config value for key 'nonexistent:key' from undefined: undefined" + "Configuration key not found."
```

#### Trace Commands ✅ TESTED - PASSING
```bash
# Trace List - Normal mode
hami trace list
# ✅ PASS: Shows table with id, timestamp columns

# Trace List - Verbose mode
hami trace list --verbose
# ✅ PASS: Shows directory validation checks + "Results displayed as table" message

# Trace Show - Normal mode
hami trace show <trace-id>
# ✅ PASS: Shows pretty-printed JSON with timestamp prefix

# Trace Show - Verbose mode
hami trace show <trace-id> --verbose
# ✅ PASS: Shows validation checks + "Fetched trace" message + JSON output

# Trace Grep - With matches
hami trace grep "flow"
# ✅ PASS: Shows table with matching traces, data column shows full JSON

# Trace Grep - With matches and verbose
hami trace grep "flow" --verbose
# ✅ PASS: Shows validation checks + "Found X traces matching" + table + "Results displayed as table"

# Trace Grep - No matches
hami trace grep "nonexistent"
# ✅ PASS: Shows empty table (just headers)

# Trace Grep - No matches with verbose
hami trace grep "nonexistent" --verbose
# ✅ PASS: Shows validation checks + "Found 0 traces matching" + empty table + "Results displayed as table"
```

#### Build Verification
```bash
# Build all packages
bun all:build && bun cli:install
```

### Test Scenarios to Cover
1. **Table formatting** - All list commands should show data in table format ✅ VERIFIED
2. **Verbose mode** - Should show "Results displayed as table" message only when enabled ✅ VERIFIED
3. **Empty results** - Commands with no data should show appropriate empty messages ✅ VERIFIED
4. **JSON formatting** - Trace show should display pretty-printed JSON ✅ VERIFIED
5. **Prefix display** - Each command should show appropriate prefixes ✅ VERIFIED
6. **Timestamp inclusion** - Flow run and trace show should include timestamps ✅ VERIFIED
7. **Global/Local separation** - Config commands should respect global flag ✅ VERIFIED

### Expected Behaviors
- **Normal mode**: Clean output with tables/JSON as appropriate ✅ VERIFIED
- **Verbose mode**: Additional logging context + "Results displayed as table" for table outputs ✅ VERIFIED
- **Empty results**: Empty tables (headers only) or appropriate "no data" messages ✅ VERIFIED
- **Error handling**: Proper error messages for invalid operations
