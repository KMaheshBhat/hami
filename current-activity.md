# HAMI Project: Flow Composition Pattern - "Dynamic Flow Runner"

## Overview
**Short Name**: "Dynamic Flow Runner"

**Context**: The current `handleFlowRun()` implementation in `apps/hami-cli/src/cmd/flow.ts` uses two separate Flow instances with glue code between them. Since Flows are Nodes in PocketFlow, we can consolidate this into a single composite Flow for better reusability and composability.

**Location**: `apps/hami-cli/src/cmd/flow.ts` - `handleFlowRun()` function
**Related Files**:
- `packages/core/src/types.ts` - HAMINode/HAMIFlow definitions
- `packages/core/src/registration.ts` - HAMIRegistrationManager
- `packages/core-fs/src/operations/copy-flow.ts` - Example HAMIFlow implementation

## Development Environment

### Project Root: `D:\local\work\personal\k.mahesh.bhat\repos\github.com\KMaheshBhat\hami`
- **Type**: Bun monorepo with workspaces
- **Build Command**: `bun run all:build` (builds all packages)
- **CLI Install**: `bun run cli:install` (installs CLI globally)
- **Package Structure**:
  - `packages/core/` - Core types, registration, validation
  - `packages/core-fs/` - File system operations
  - `packages/core-config-fs/` - Configuration management
  - `packages/core-trace-fs/` - Trace logging
  - `apps/hami-cli/` - CLI application
  - `apps/hami-server/` - Server application

### References
- `packages/core-fs/src/operations/copy-flow.ts` - reference on how to construct concrete HAMIFlow
- Full PocketFlow source code
```typescript
type NonIterableObject = Partial<Record<string, unknown>> & { [Symbol.iterator]?: never }; type Action = string;
class BaseNode<S = unknown, P extends NonIterableObject = NonIterableObject> {
  protected _params: P = {} as P; protected _successors: Map<Action, BaseNode> = new Map();
  protected async _exec(prepRes: unknown): Promise<unknown> { return await this.exec(prepRes); }
  async prep(shared: S): Promise<unknown> { return undefined; }
  async exec(prepRes: unknown): Promise<unknown> { return undefined; }
  async post(shared: S, prepRes: unknown, execRes: unknown): Promise<Action | undefined> { return undefined; }
  async _run(shared: S): Promise<Action | undefined> {
    const p = await this.prep(shared), e = await this._exec(p); return await this.post(shared, p, e);
  }
  async run(shared: S): Promise<Action | undefined> {
    if (this._successors.size > 0) console.warn("Node won't run successors. Use Flow.");
    return await this._run(shared);
  }
  setParams(params: P): this { this._params = params; return this; }
  next<T extends BaseNode>(node: T): T { this.on("default", node); return node; }
  on(action: Action, node: BaseNode): this {
    if (this._successors.has(action)) console.warn(`Overwriting successor for action '${action}'`);
    this._successors.set(action, node); return this;
  }
  getNextNode(action: Action = "default"): BaseNode | undefined {
    const nextAction = action || 'default', next = this._successors.get(nextAction)
    if (!next && this._successors.size > 0)
      console.warn(`Flow ends: '${nextAction}' not found in [${Array.from(this._successors.keys())}]`)
    return next
  }
  clone(): this {
    const clonedNode = Object.create(Object.getPrototypeOf(this)); Object.assign(clonedNode, this);
    clonedNode._params = { ...this._params }; clonedNode._successors = new Map(this._successors);
    return clonedNode;
  }
}
class Node<S = unknown, P extends NonIterableObject = NonIterableObject> extends BaseNode<S, P> {
  maxRetries: number; wait: number; currentRetry: number = 0;
  constructor(maxRetries: number = 1, wait: number = 0) {
    super(); this.maxRetries = maxRetries; this.wait = wait;
  }
  async execFallback(prepRes: unknown, error: Error): Promise<unknown> { throw error; }
  async _exec(prepRes: unknown): Promise<unknown> {
    for (this.currentRetry = 0; this.currentRetry < this.maxRetries; this.currentRetry++) {
      try { return await this.exec(prepRes); } 
      catch (e) {
        if (this.currentRetry === this.maxRetries - 1) return await this.execFallback(prepRes, e as Error);
        if (this.wait > 0) await new Promise(resolve => setTimeout(resolve, this.wait * 1000));
      }
    }
    return undefined;
  }
}
class BatchNode<S = unknown, P extends NonIterableObject = NonIterableObject> extends Node<S, P> {
  async _exec(items: unknown[]): Promise<unknown[]> {
    if (!items || !Array.isArray(items)) return [];
    const results = []; for (const item of items) results.push(await super._exec(item)); return results;
  }
}
class ParallelBatchNode<S = unknown, P extends NonIterableObject = NonIterableObject> extends Node<S, P> {
  async _exec(items: unknown[]): Promise<unknown[]> {
    if (!items || !Array.isArray(items)) return []
    return Promise.all(items.map((item) => super._exec(item)))
  }
}
class Flow<S = unknown, P extends NonIterableObject = NonIterableObject> extends BaseNode<S, P> {
  start: BaseNode;
  constructor(start: BaseNode) { super(); this.start = start; }
  protected async _orchestrate(shared: S, params?: P): Promise<void> {
    let current: BaseNode | undefined = this.start.clone();
    const p = params || this._params;
    while (current) {
      current.setParams(p); const action = await current._run(shared);
      current = current.getNextNode(action); current = current?.clone();
    }
  }
  async _run(shared: S): Promise<Action | undefined> {
    const pr = await this.prep(shared); await this._orchestrate(shared);
    return await this.post(shared, pr, undefined);
  }
  async exec(prepRes: unknown): Promise<unknown> { throw new Error("Flow can't exec."); }
}
class BatchFlow<S = unknown, P extends NonIterableObject = NonIterableObject, NP extends NonIterableObject[] = NonIterableObject[]> extends Flow<S, P> {
  async _run(shared: S): Promise<Action | undefined> {
    const batchParams = await this.prep(shared);
    for (const bp of batchParams) {
      const mergedParams = { ...this._params, ...bp };
      await this._orchestrate(shared, mergedParams);
    }
    return await this.post(shared, batchParams, undefined);
  }
  async prep(shared: S): Promise<NP> { const empty: readonly NonIterableObject[] = []; return empty as NP; }
}
class ParallelBatchFlow<S = unknown, P extends NonIterableObject = NonIterableObject, NP extends NonIterableObject[] = NonIterableObject[]> extends BatchFlow<S, P, NP> {
  async _run(shared: S): Promise<Action | undefined> {
    const batchParams = await this.prep(shared);
    await Promise.all(batchParams.map(bp => {
      const mergedParams = { ...this._params, ...bp };
      return this._orchestrate(shared, mergedParams);
    }));
    return await this.post(shared, batchParams, undefined);
  }
}
export { BaseNode, Node, BatchNode, ParallelBatchNode, Flow, BatchFlow, ParallelBatchFlow };
```

### Testing Directory: `D:\local\work\personal\k.mahesh.bhat\test-hami\wd1`
- **Purpose**: Test environment with pre-configured flows
- **Existing Configurations**:
  - Flow configurations stored in `.hami/wd.config.json`
  - Trace data available for testing
- **Usage**: Run CLI commands here to test functionality

## Current Implementation Analysis

### What We Have Now (Working!)
The current implementation successfully consolidates the dual-flow pattern into a single Flow using a clever `NodeFromConfigNode`:

```typescript
// Single Flow with dynamic node chaining:
const validateWorkingDirectory = registry.createNode("core-fs:validate-hami", {});
const coreConfigFSGet = registry.createNode("core-config-fs:get", {});
const nodeFromConfig = new NodeFromConfigNode(); // The "glue" node

validateWorkingDirectory.next(coreConfigFSGet).next(nodeFromConfig);

const flow = new Flow(validateWorkingDirectory);
await flow.run(shared);
```

**How `NodeFromConfigNode` works:**
- **prep()**: Extracts `{ kind, config }` from `shared.configValue` and calls `registry.createNode(kind, config)`
- **post()**: Chains the dynamically created node as its successor using `this.next(prepRes)`

This creates a single Flow that:
1. Validates working directory
2. Retrieves flow configuration
3. Dynamically instantiates and chains the target flow/node
4. Executes everything in one orchestrated flow

### The Pattern Opportunity
The working implementation shows that the core pattern is already achieved! The remaining work is to extract this into a reusable `DynamicFlowRunnerFlow` class for better composability.

## Revised Architecture: DynamicRunnerNode as Flow

### The Issue
The current `DynamicRunnerNode` approach works but has a fundamental problem: it modifies the node graph dynamically during execution (`this.next(prepRes)`), which PocketFlow warns about. This violates the framework's expectation that the graph is static.

### The Solution: DynamicRunnerNode as Flow
Instead of a Node that manipulates successors, we need a **Flow** that contains the dynamic node as its start node, allowing proper orchestration.

### Revised Architecture

#### 1. DynamicRunnerFlow (PocketFlow Flow)
```typescript
class DynamicRunnerFlow extends Flow {
  constructor(registry: HAMIRegistrationManager) {
    // This flow will dynamically set its start node
    super(null as any); // We'll set start dynamically
  }

  async prep(shared: Record<string, any>): Promise<Node | string> {
    // Same logic as before: extract config and create node
    if (!shared.configValue) return 'No config value found';
    if (!shared.registry) return 'No registry found';
    const { kind, config } = shared.configValue;
    return shared.registry.createNode(kind, config);
  }

  async _run(shared: Record<string, any>): Promise<string | undefined> {
    const dynamicNode = await this.prep(shared);
    if (typeof dynamicNode === 'string') {
      shared['dynamicRunnerError'] = dynamicNode;
      return 'error';
    }

    // Set the dynamic node as our start and run
    this.start = dynamicNode;
    return await super._run(shared);
  }
}
```

#### 2. Updated Flow Chain
```typescript
// Instead of: validate -> getConfig -> runnerNode -> trace -> log -> results
// We have:    validate -> getConfig -> runnerFlow -> results

const runnerFlow = new DynamicRunnerFlow(registry);
const logResults = new LogResult("results");

validate.next(getConfig).next(runnerFlow).next(logResults);
```

### Benefits of Flow-based Approach

1. **Framework Compliance**: No dynamic graph modification during execution
2. **Proper Orchestration**: PocketFlow handles the dynamic node execution correctly
3. **Clean Separation**: The Flow encapsulates the dynamic behavior
4. **Composable**: Can be used anywhere a Flow is expected
5. **Testable**: Easier to test Flow orchestration vs node manipulation

### Implementation Plan

#### Phase 1: Convert DynamicRunnerNode to DynamicRunnerFlow
1. Change from extending `Node` to extending `Flow`
2. Move dynamic logic from `prep/post` to Flow's `_run` method
3. Update constructor and error handling

#### Phase 2: Update Flow Chaining
1. Simplify the node chain in `handleFlowRun()`
2. Remove complex successor manipulation
3. Test that dynamic execution still works

#### Phase 3: Extract to Reusable Component
1. Move `DynamicRunnerFlow` to shared location
2. Create `DynamicFlowRunnerFlow` wrapper if needed
3. Update documentation

## Current Status
The current implementation works but violates PocketFlow patterns. Converting to a Flow-based approach will be more maintainable and framework-compliant.

**Ready to implement the Flow-based solution!** 🔄