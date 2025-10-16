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

### What We Have Now
```typescript
// In handleFlowRun():
// 1. First Flow: Static config retrieval
const getFlow = new Flow(validateWorkingDirectory);
// ... runs and gets config

// 2. Glue code: Dynamic instantiation
if (!shared.configValue) return;
const { kind, config } = shared.configValue;
const flowNode = registry.createNode(kind, config);

// 3. Second Flow: Dynamic execution
const runFlow = new Flow(flowNode);
```

### The Pattern Opportunity
Create a single wrapper Flow containing:
1. **FlowRetrieverFlow**: Static sub-flow for config retrieval (PocketFlow Flow or HAMIFlow)
2. **DynamicFlowRunnerNode**: Glue node that instantiates target flow
3. **Dynamically loaded flow**: As the final successor

## Proposed Architecture

### 1. FlowRetrieverFlow (PocketFlow Flow or HAMIFlow)
```typescript
class FlowRetrieverFlow extends HAMIFlow<SharedContext> {
  constructor(flowName: string) {
    // Create a simple flow that retrieves config
    const validateNode = new ValidateWorkingDirectoryNode();
    const getConfigNode = new GetFlowConfigNode(flowName);

    validateNode.next(getConfigNode);
    super(validateNode);
  }
}

class GetFlowConfigNode extends HAMINode<SharedContext> {
  constructor(private flowName: string) { super(); }

  kind(): string { return "flow:get-config"; }

  async exec(): Promise<FlowConfig> {
    // Retrieve flow config from registry/config
    const config = await getFlowConfig(this.flowName);
    return config; // { kind: "core-fs:copy-flow", config: {...} }
  }
}
```

### 2. DynamicFlowRunnerNode
```typescript
class DynamicFlowRunnerNode extends HAMINode<SharedContext> {
  constructor(private registry: HAMIRegistrationManager) { super(); }

  kind(): string { return "flow:dynamic-runner"; }

  async prep(shared: SharedContext): Promise<FlowConfig> {
    // FlowRetrieverNode puts config in shared context
    return shared.flowConfig;
  }

  async exec(flowConfig: FlowConfig): Promise<HAMINode> {
    // Instantiate the target flow dynamically
    return this.registry.createNode(flowConfig.kind, flowConfig.config);
  }

  async post(shared: SharedContext, prepRes: FlowConfig, execRes: HAMINode): Promise<string> {
    // Set up the dynamic flow as successor
    this.next(execRes);
    return "default";
  }
}
```

### 3. Composite DynamicFlowRunner Flow
```typescript
class DynamicFlowRunnerFlow extends HAMIFlow<SharedContext> {
  constructor(registry: HAMIRegistrationManager, flowName: string) {
    const flowRetriever = new FlowRetrieverNode();
    const dynamicRunner = new DynamicFlowRunnerNode(registry);

    // Chain: retriever -> runner -> dynamic flow
    flowRetriever.next(dynamicRunner);

    super(flowRetriever);
    this.config = { flowName, registry };
  }
}
```

## Benefits

1. **Single Flow Instance**: Eliminates glue code between separate flows
2. **Reusable Pattern**: Can be used for any dynamic flow execution scenario
3. **Better Composition**: Leverages PocketFlow's node chaining naturally
4. **Testability**: Each component can be tested independently
5. **Extensibility**: Easy to add pre/post processing nodes

## Implementation Plan

### Phase 1: Core Components
1. Create `FlowRetrieverNode` for config retrieval
2. Create `DynamicFlowRunnerNode` for instantiation
3. Create `DynamicFlowRunnerFlow` composite

### Phase 2: Refactor handleFlowRun()
1. Replace dual-flow implementation with single `DynamicFlowRunnerFlow`
2. Update CLI integration
3. Test functionality

### Phase 3: Pattern Extraction
1. Make pattern configurable for different retrieval strategies
2. Add support for flow parameters/payload injection
3. Create base classes for similar patterns

## Next Steps
This refactoring would make the flow execution pattern more reusable and better aligned with PocketFlow's composition model. The current implementation works but this would provide a cleaner, more maintainable architecture.