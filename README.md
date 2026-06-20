# HAMI (Human Agent Machine Interface)

A modular, plugin-based framework for building human-agent workflows and machine interfaces using TypeScript.

## What is HAMI 0.2.x?

HAMI (Human Agent Machine Interface) is a lightweight in-process runtime for graph-based operational thinking.

At its core, HAMI provides:

* A graph substrate
* A flow runtime
* Capability contracts
* Provider contracts
* Plugin loading
* A testing story

Nothing more.

## Why does HAMI exist?

Across multiple projects, the same pattern kept reappearing:

* Information represented as nodes
* Relationships represented as edges
* Operations traversing and mutating those structures
* Capabilities encapsulating reusable behavior
* Providers integrating with external systems

The domain changed.

The plumbing did not.

HAMI exists to avoid rebuilding that plumbing.

## Scope

HAMI is intentionally constrained.

HAMI is:

* In-process
* Non-durable
* Request-scoped
* Graph-oriented
* Capability-driven

HAMI is not:

* A workflow engine
* A distributed orchestrator
* A scheduler
* A message bus
* A persistence framework
* An agent platform

If you need orchestration across process boundaries, use tools designed for orchestration across process boundaries.

## Philosophy

The graph is the substrate.

The capability is the meaning.

HAMI is not the product.

Applications, capabilities, and providers are where domain-specific behavior belongs.

HAMI's responsibility is to provide a predictable environment in which operational thinking can occur.

## North Star

### Core Responsibilities

1. Graph substrate
2. Flow runtime
3. Capability contract
4. Provider contract
5. Plugin loading
6. Testing story

### Execution Model

1. In-process only
2. Non-durable
3. Request-scoped
4. No cross-process orchestration
5. No distributed coordination
6. Persistence delegated to capabilities and providers

### Definition

A graph-backed working memory for a single operational thought.
