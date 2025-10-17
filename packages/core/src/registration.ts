/**
 * HAMI Plugin Registration System
 * @packageDocumentation
 */

import { HAMIFlow, HAMINode } from './types.js';

/**
 * Plugin interface for dynamic HAMINode loading
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
 * HAMI Registration Manager
 * Manages registration and instantiation of HAMINode and HAMIFlow classes
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
   * Register a HAMINode or HAMIFlow class
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
   * Create a node instance from registered class
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
   * Get node classes by category
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
   * Register a plugin
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
 * Global HAMI registration manager instance
 */
export const hamiRegistrationManager = new HAMIRegistrationManager();

/**
 * Helper function to create a simple plugin
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