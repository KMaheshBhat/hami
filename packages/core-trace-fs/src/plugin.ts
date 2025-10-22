import { createPlugin } from "@hami-frameworx/core";

import { CoreTraceFSInjectNode, CoreTraceFSLogNode, CoreTraceFSListNode, CoreTraceFSShowNode, CoreTraceFSGrepNode } from "./ops/index.js";

/**
 * Core Trace File System Plugin for HAMI.
 * Provides essential trace logging and retrieval operations for storing and accessing
 * workflow execution traces in the file system.
 *
 * Included operations:
 * - `core-trace-fs:inject`: Injects trace data into the workflow for logging
 * - `core-trace-fs:log`: Logs trace data with timestamp and unique ID to the file system
 * - `core-trace-fs:list`: Lists all trace entries with their IDs and timestamps
 * - `core-trace-fs:show`: Retrieves a specific trace entry by its unique ID
 * - `core-trace-fs:grep`: Searches trace entries using text-based queries
 */
const CoreTraceFSPlugin = createPlugin(
    "core-trace-fs",
    "0.1.0",
    [
        CoreTraceFSInjectNode as any,
        CoreTraceFSLogNode as any,
        CoreTraceFSListNode as any,
        CoreTraceFSShowNode as any,
        CoreTraceFSGrepNode as any,
    ],
    "HAMI Core Trace File System Plugin",
);

export { CoreTraceFSPlugin };