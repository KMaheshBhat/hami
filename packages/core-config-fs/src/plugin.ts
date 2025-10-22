import { createPlugin } from "@hami-frameworx/core";

import { CoreConfigFSGetNode, CoreConfigFSGetAllNode, CoreConfigFSSetNode, CoreConfigFSRemoveNode } from "./ops/index.js";

/**
 * Core Configuration File System Plugin for HAMI.
 * Provides essential configuration file operations including getting, setting, and removing config values
 * from local and global config files stored in .hami directories.
 *
 * Included operations:
 * - `core-config-fs:get`: Retrieves a specific configuration value by key
 * - `core-config-fs:get-all`: Retrieves all configuration values from local, global, or merged sources
 * - `core-config-fs:set`: Sets a configuration value by key in local or global config
 * - `core-config-fs:remove`: Removes a configuration value by key from local or global config
 */
const CoreConfigFSPlugin = createPlugin(
    "core-config-fs",
    "0.1.0",
    [
        CoreConfigFSGetNode as any,
        CoreConfigFSGetAllNode as any,
        CoreConfigFSSetNode as any,
        CoreConfigFSRemoveNode as any,
    ],
    "HAMI Core Configuration File System Plugin",
);

export { CoreConfigFSPlugin };