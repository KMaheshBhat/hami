/**
 * Core type definitions for HAMI (Human Agent Machine Interface).
 *
 * This module defines the fundamental types and base classes for HAMI's node-based
 * workflow system. It provides the abstract base classes HAMINode and HAMIFlow
 * that all HAMI operations and flows must extend.
 *
 * Key Concepts:
 * - HAMINode: Individual operation units that process data
 * - HAMIFlow: Composed workflows of connected nodes
 * - Configuration validation: Built-in config validation for type safety
 * - Shared state: Nodes communicate through a shared data object
 *
 * @packageDocumentation
 */

import { BaseNode, Flow, Node } from "pocketflow";

/**
 * Result of configuration validation for HAMI nodes and flows.
 * Provides validation status and any error messages.
 */
export type HAMINodeConfigValidateResult = {
    /** Whether the configuration is valid */
    valid: boolean;
    /** List of validation error messages */
    errors: string[];
};

/**
 * Abstract base class for all HAMI operations (nodes).
 *
 * HAMINode extends PocketFlow's Node class and adds HAMI-specific features:
 * - Configuration validation on construction
 * - Type-safe configuration handling
 * - Abstract kind() method for node identification
 * - Built-in error handling for invalid configurations
 *
 * @template S The type of shared state data (defaults to unknown)
 * @template C The type of configuration object (defaults to unknown)
 *
 * @example
 * ```typescript
 * interface MyNodeConfig {
 *   inputKey: string;
 *   outputKey: string;
 * }
 *
 * class MyNode extends HAMINode<Record<string, any>, MyNodeConfig> {
 *   kind(): string {
 *     return 'my-namespace:my-node';
 *   }
 *
 *   validateConfig(config: MyNodeConfig): HAMINodeConfigValidateResult {
 *     // Custom validation logic
 *     return { valid: true, errors: [] };
 *   }
 *
 *   async prep(shared: Record<string, any>): Promise<any> {
 *     return shared[this.config!.inputKey];
 *   }
 *
 *   async exec(prepRes: any): Promise<void> {
 *     // Process the data
 *     shared[this.config!.outputKey] = processedData;
 *   }
 * }
 * ```
 */
export abstract class HAMINode<S = unknown, C = unknown> extends Node<S> {
    /** Protected configuration instance, validated during construction */
    protected config: C | undefined = undefined;

    /**
     * Constructs a new HAMINode instance.
     *
     * Validates the configuration if provided and throws an error if validation fails.
     * Sets up retry behavior inherited from the base Node class.
     *
     * @param config Optional configuration object for the node
     * @param maxRetries Maximum number of execution retries (default: 1)
     * @param wait Wait time in milliseconds between retries (default: 0)
     * @throws Error if configuration validation fails
     */
    constructor(config: C | undefined = undefined, maxRetries: number = 1, wait: number = 0) {
        super(maxRetries, wait);
        this.config = config;
        if (!config) return;
        const validation = this.validateConfig(config);
        if (!validation.valid) {
            throw new Error(
                `Invalid configuration for HAMINode ${this.kind()}`,
                {
                    cause: validation.errors,
                }
            );
        }
    }
    /**
     * Returns the unique kind identifier for this node type.
     *
     * The kind follows the format 'namespace:node-name' (e.g., 'core:debug', 'fs:read-file').
     * This identifier is used for node registration and instantiation.
     *
     * @returns The node's kind string
     */
    abstract kind(): string;

    /**
     * Validates the node configuration.
     *
     * Override this method to implement custom configuration validation.
     * By default, all configurations are considered valid.
     *
     * @param _config The configuration object to validate
     * @returns Validation result with success status and any errors
     */
    validateConfig(_config: C): HAMINodeConfigValidateResult {
        return { valid: true, errors: [] };
    }
}

/**
 * Abstract base class for all HAMI flows (composed workflows).
 *
 * HAMIFlow extends PocketFlow's Flow class and adds HAMI-specific features:
 * - Configuration validation on construction
 * - Type-safe configuration handling
 * - Abstract kind() method for flow identification
 * - Built-in error handling for invalid configurations
 *
 * Flows are composed of connected nodes that execute in sequence or based on conditions.
 *
 * @template S The type of shared state data (defaults to unknown)
 * @template C The type of configuration object (defaults to unknown)
 *
 * @example
 * ```typescript
 * interface MyFlowConfig {
 *   inputKey: string;
 *   outputKey: string;
 * }
 *
 * class MyFlow extends HAMIFlow<Record<string, any>, MyFlowConfig> {
 *   constructor(config: MyFlowConfig) {
 *     const startNode = new MyProcessingNode({ inputKey: config.inputKey });
 *     super(startNode, config);
 *   }
 *
 *   kind(): string {
 *     return 'my-namespace:my-flow';
 *   }
 *
 *   validateConfig(config: MyFlowConfig): HAMINodeConfigValidateResult {
 *     // Custom validation logic
 *     return { valid: true, errors: [] };
 *   }
 * }
 * ```
 */
export abstract class HAMIFlow<S = unknown, C = unknown> extends Flow<S> {
    /** Protected configuration instance, validated during construction */
    protected config: C | undefined = undefined;

    /**
     * Constructs a new HAMIFlow instance.
     *
     * Validates the configuration and throws an error if validation fails.
     * Sets up the flow with the specified starting node.
     *
     * @param start The starting node of the flow
     * @param config Configuration object for the flow
     * @throws Error if configuration validation fails
     */
    constructor(start: BaseNode, config: C) {
        super(start);
        this.config = config;
        if (!config) return;
        const validation = this.validateConfig(config);
        if (!validation.valid) {
            throw new Error(`Invalid configuration for HAMIFlow ${this.kind()}`, {
                cause: validation.errors,
            });
        }
    }
    /**
     * Returns the unique kind identifier for this flow type.
     *
     * The kind follows the format 'namespace:flow-name' (e.g., 'core:dynamic-runner-flow').
     * This identifier is used for flow registration and instantiation.
     *
     * @returns The flow's kind string
     */
    abstract kind(): string;

    /**
     * Validates the flow configuration.
     *
     * Override this method to implement custom configuration validation.
     * By default, all configurations are considered valid.
     *
     * @param _config The configuration object to validate
     * @returns Validation result with success status and any errors
     */
    validateConfig(_config: C): HAMINodeConfigValidateResult {
        return { valid: true, errors: [] };
    }
}