/**
 * @packageDocumentation
 * HAMI Core Plugin
 *
 * This module defines the core plugin for HAMI, which provides fundamental node classes
 * for logging, debugging, data mapping, and dynamic execution. The plugin can be registered
 * with a HAMIRegistrationManager instance to make these core operations available in HAMI workflows.
 */

import { createPlugin } from "./registration.js";
import { LogResultNode, LogErrorNode, DynamicRunnerNode, DynamicRunnerFlow, MapNode, DebugNode } from "./ops/index.js";

/**
 * The HAMI Core Plugin instance.
 *
 * This plugin provides the following core node classes:
 * - `LogResultNode` ('core:log-result'): Logs result data with various formatting options
 * - `LogErrorNode` ('core:log-error'): Logs error information from shared state
 * - `DynamicRunnerNode` ('core:dynamic-runner'): Dynamically creates and runs nodes based on configuration
 * - `DynamicRunnerFlow` ('core:dynamic-runner-flow'): Flow wrapper for dynamic node execution
 * - `MapNode` ('core:map'): Maps and transforms properties in shared state using dot-notation paths
 * - `DebugNode` ('core:debug'): Logs the entire shared state for debugging purposes
 *
 * To use this plugin, register it with a HAMIRegistrationManager:
 * ```typescript
 * import { hamiRegistrationManager } from './registration.js';
 * import { CorePlugin } from './plugin.js';
 *
 * await hamiRegistrationManager.registerPlugin(CorePlugin);
 * ```
 */
const CorePlugin = createPlugin(
    "@hami/core",
    "1.0.0",
    [
        LogResultNode as any,
        LogErrorNode as any,
        DynamicRunnerNode as any,
        DynamicRunnerFlow as any,
        MapNode as any,
        DebugNode as any,
    ],
    "HAMI Core Plugin - Fundamental nodes for logging and dynamic execution",
);

export { CorePlugin };