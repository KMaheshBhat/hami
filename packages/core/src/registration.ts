/**
 * HAMI Plugin Registration System
 *
 * This module provides the core plugin architecture for HAMI (Human Agent Machine Interface).
 * It enables dynamic loading and management of HAMINode and HAMIFlow classes through a plugin system,
 * allowing for extensible workflow capabilities.
 *
 * Key Features:
 * - Plugin-based architecture for modular node registration
 * - Event-driven registration lifecycle
 * - Type-safe node instantiation
 * - Category-based node discovery
 *
 * @packageDocumentation
 */

import { HAMIFlow, HAMINode } from './types.js';

/**
 * Plugin interface for dynamic HAMINode loading.
 *
 * Plugins encapsulate collections of related node classes and provide lifecycle management.
 * They enable modular extension of HAMI's capabilities without modifying core code.
 *
 * Example implementation:
 * ```typescript
 * const myPlugin: HAMIPlugin = {
 *   name: "my-custom-plugin",
 *   version: "1.0.0",
 *   description: "Custom nodes for specialized workflows",
 *   async initialize() {
 *     // Setup plugin resources
 *   },
 *   async getNodeClasses() {
 *     return [MyCustomNode, MyCustomFlow];
 *   },
 *   async destroy() {
 *     // Cleanup plugin resources
 *   }
 * };
 * ```
 */
export interface HAMIPlugin {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin description */
  description?: string;
  /** Initialize the plugin */
  initialize(): Promise<void> | void;
  /** Get HAMINode classes provided by this plugin */
  getNodeClasses(): Promise<(typeof HAMINode | typeof HAMIFlow)[]>;
  /** Cleanup plugin resources */
  destroy?(): Promise<void> | void;
}

/**
 * Registration event types
 */
export type RegistrationEvent = 'beforeRegister' | 'afterRegister' | 'beforeUnregister' | 'afterUnregister';

/**
 * Registration event handler
 */
export type RegistrationEventHandler = (event: RegistrationEvent, nodeClass: typeof HAMINode | typeof HAMIFlow) => void | Promise<void>;

/**
 * HAMI Registration Manager - Central registry for nodes and plugins.
 *
 * This class manages the lifecycle of HAMINode and HAMIFlow classes, providing:
 * - Registration and unregistration of individual node classes
 * - Plugin management with automatic node class registration
 * - Event-driven architecture for registration lifecycle hooks
 * - Type-safe node instantiation with configuration validation
 * - Category-based node discovery and filtering
 *
 * Usage:
 * ```typescript
 * const manager = new HAMIRegistrationManager();
 *
 * // Register a plugin
 * await manager.registerPlugin(myPlugin);
 *
 * // Create a node instance
 * const node = manager.createNode('my-plugin:custom-node', { config: 'value' });
 *
 * // Get nodes by category
 * const loggingNodes = manager.getNodeClassesByCategory('logging');
 * ```
 */
export class HAMIRegistrationManager {
  private nodeClasses = new Map<string, typeof HAMINode | typeof HAMIFlow>();
  private plugins = new Map<string, HAMIPlugin>();
  private eventHandlers = new Map<RegistrationEvent, RegistrationEventHandler[]>();

  /**
   * Register an event handler
   */
  on(event: RegistrationEvent, handler: RegistrationEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove an event handler
   */
  off(event: RegistrationEvent, handler: RegistrationEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all registered handlers
   */
  private async emit(event: RegistrationEvent, nodeClass: typeof HAMINode | typeof HAMIFlow): Promise<void> {
    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      await handler(event, nodeClass);
    }
  }

  /**
   * Register a HAMINode or HAMIFlow class.
   *
   * Creates a temporary instance to determine the node's kind identifier,
   * then stores the class for later instantiation. Emits 'beforeRegister'
   * and 'afterRegister' events.
   *
   * @param nodeClass The node class constructor to register
   * @throws Error if registration fails or node kind cannot be determined
   */
  async registerNodeClass(nodeClass: typeof HAMINode | typeof HAMIFlow): Promise<void> {
    // Create a dummy instance to get the kind (without config to avoid validation)
    const dummyInstance = new (nodeClass as any)();
    const kind = dummyInstance.kind();

    await this.emit('beforeRegister', nodeClass);

    this.nodeClasses.set(kind, nodeClass);

    await this.emit('afterRegister', nodeClass);
  }

  /**
   * Unregister a HAMINode or HAMIFlow class by kind
   */
  async unregisterNodeClass(kind: string): Promise<void> {
    const nodeClass = this.nodeClasses.get(kind);
    if (!nodeClass) {
      return;
    }

    await this.emit('beforeUnregister', nodeClass);

    this.nodeClasses.delete(kind);

    await this.emit('afterUnregister', nodeClass);
  }

  /**
   * Get a registered node class by kind
   */
  getNodeClass(kind: string): typeof HAMINode | typeof HAMIFlow | undefined {
    return this.nodeClasses.get(kind);
  }

  /**
   * Create a node instance from a registered class.
   *
   * Instantiates a node using the registered class constructor with the provided
   * configuration. The constructor handles config validation automatically.
   *
   * @param kind The node kind identifier (e.g., 'core:debug', 'my-plugin:custom')
   * @param config Optional configuration object passed to the node constructor
   * @param maxRetries Optional maximum retry attempts for node execution
   * @param wait Optional wait time between retries in milliseconds
   * @returns A new instance of the requested node type
   * @throws Error if no node class is registered for the given kind
   *
   * @example
   * ```typescript
   * const debugNode = manager.createNode('core:debug');
   * const customNode = manager.createNode('my-plugin:processor', { input: 'data' }, 3, 1000);
   * ```
   */
  createNode(kind: string, config?: any, maxRetries?: number, wait?: number): HAMINode | HAMIFlow {
    const nodeClass = this.getNodeClass(kind);
    if (!nodeClass) {
      throw new Error(`No node class registered for kind: ${kind}`);
    }

    // Use constructor which already handles validation
    return new (nodeClass as any)(config, maxRetries, wait);
  }

  /**
   * Get all registered node classes
   */
  getAllNodeClasses(): (typeof HAMINode | typeof HAMIFlow)[] {
    return Array.from(this.nodeClasses.values());
  }

  /**
   * Get node classes by category.
   *
   * Filters registered node classes based on their kind prefix.
   * Node kinds use colon-separated namespaces (e.g., 'core:debug', 'fs:read-file').
   *
   * @param category The category prefix to filter by (e.g., 'core', 'fs', 'logging')
   * @returns Array of node classes matching the category
   *
   * @example
   * ```typescript
   * const coreNodes = manager.getNodeClassesByCategory('core');
   * // Returns [DebugNode, LogResultNode, MapNode, ...]
   * ```
   */
  getNodeClassesByCategory(category: string): (typeof HAMINode | typeof HAMIFlow)[] {
    return this.getAllNodeClasses().filter(nodeClass => {
      const dummyInstance = new (nodeClass as any)();
      return dummyInstance.kind().startsWith(`${category}:`);
    });
  }

  /**
   * Check if a kind is registered
   */
  hasNodeClass(kind: string): boolean {
    return this.nodeClasses.has(kind);
  }

  /**
   * Register a plugin and all its node classes.
   *
   * Initializes the plugin, retrieves its node classes, and registers each one.
   * If initialization fails, automatically cleans up any allocated resources.
   *
   * @param plugin The plugin instance to register
   * @throws Error if plugin is already registered or initialization fails
   *
   * @example
   * ```typescript
   * import { CorePlugin } from './packages/core/src/plugin.js';
   *
   * await manager.registerPlugin(CorePlugin);
   * ```
   */
  async registerPlugin(plugin: HAMIPlugin): Promise<void> {
    // Check if plugin is already registered
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already registered`);
    }

    try {
      // Initialize the plugin
      await plugin.initialize();

      // Get node classes from the plugin
      const nodeClasses = await Promise.resolve(plugin.getNodeClasses());

      // Register all node classes from the plugin
      for (const nodeClass of nodeClasses) {
        await this.registerNodeClass(nodeClass);
      }

      // Store the plugin
      this.plugins.set(plugin.name, plugin);
    } catch (error) {
      // If initialization fails, clean up
      if (plugin.destroy) {
        const destroyResult = plugin.destroy();
        if (destroyResult instanceof Promise) {
          await destroyResult.catch(() => {});
        }
      }
      throw error;
    }
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return;
    }

    try {
      // Get node classes from the plugin
      const nodeClasses = await Promise.resolve(plugin.getNodeClasses());

      // Unregister all node classes from the plugin
      for (const nodeClass of nodeClasses) {
        const dummyInstance = new (nodeClass as any)();
        await this.unregisterNodeClass(dummyInstance.kind());
      }

      // Cleanup plugin resources
      if (plugin.destroy) {
        await plugin.destroy();
      }

      // Remove the plugin
      this.plugins.delete(pluginName);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): HAMIPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get a registered plugin by name
   */
  getPlugin(name: string): HAMIPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Check if a plugin is registered
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Clear all registrations and plugins
   */
  async clear(): Promise<void> {
    // Unregister all plugins first
    const pluginNames = Array.from(this.plugins.keys());
    for (const name of pluginNames) {
      await this.unregisterPlugin(name).catch(() => {});
    }

    // Clear all node classes
    this.nodeClasses.clear();

    // Clear all event handlers
    this.eventHandlers.clear();
  }
}


/**
 * Global HAMI registration manager instance.
 *
 * This is the default registry instance used throughout HAMI applications.
 * Most applications will use this singleton rather than creating their own
 * HAMIRegistrationManager instances.
 *
 * Core plugins and custom plugins should be registered with this instance:
 * ```typescript
 * import { hamiRegistrationManager } from './registration.js';
 * import { CorePlugin } from './packages/core/src/plugin.js';
 *
 * await hamiRegistrationManager.registerPlugin(CorePlugin);
 * ```
 */
export const hamiRegistrationManager = new HAMIRegistrationManager();

/**
 * Helper function to create a simple plugin.
 *
 * Creates a basic plugin implementation with default initialize and destroy methods.
 * Useful for plugins that don't need complex lifecycle management.
 *
 * @param name Unique plugin identifier (recommended format: '@scope/name')
 * @param version Semantic version string
 * @param nodeClasses Array of node classes or function returning a promise of node classes
 * @param description Optional human-readable description
 * @returns A HAMIPlugin instance
 *
 * @example
 * ```typescript
 * const myPlugin = createPlugin(
 *   "@my-org/custom-nodes",
 *   "1.0.0",
 *   [CustomNode1, CustomNode2],
 *   "Custom workflow nodes for specialized processing"
 * );
 *
 * // Or with dynamic loading:
 * const dynamicPlugin = createPlugin(
 *   "@my-org/dynamic-nodes",
 *   "1.0.0",
 *   async () => {
 *     const modules = await import('./nodes/index.js');
 *     return Object.values(modules);
 *   }
 * );
 * ```
 */
export function createPlugin(
  name: string,
  version: string,
  nodeClasses: (typeof HAMINode | typeof HAMIFlow)[] | (() => Promise<(typeof HAMINode | typeof HAMIFlow)[]>),
  description?: string
): HAMIPlugin {
  return {
    name,
    version,
    description,
    async initialize() {
      // Simple initialization - can be extended
    },
    getNodeClasses: async () => {
      if (typeof nodeClasses === 'function') {
        return await Promise.resolve(nodeClasses());
      }
      return nodeClasses;
    },
    async destroy() {
      // Simple cleanup - can be extended
    }
  };
}