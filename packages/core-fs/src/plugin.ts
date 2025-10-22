import { createPlugin } from "@hami-frameworx/core";

import { CoreFSCopyNode, CoreFSListDirectoryNode, CoreFSReadFileNode, CoreFSWriteFileNode, InitWorkingDirectoryNode, ValidateNode } from "./ops/index.js";

/**
 * Core File System Plugin for HAMI.
 * Provides essential file system operations including directory initialization, validation,
 * file reading/writing, copying, and directory listing.
 *
 * Included operations:
 * - `core-fs:init-hami`: Initializes working directory and creates .hami directories
 * - `core-fs:validate-hami`: Validates existence of required directories
 * - `core-fs:copy`: Copies files matching glob patterns to target directories
 * - `core-fs:list-directory`: Lists directory contents with metadata
 * - `core-fs:read-file`: Reads file contents with specified encoding
 * - `core-fs:write-file`: Writes content to files, creating directories as needed
 */
const CoreFSPlugin = createPlugin(
    "core-fs",
    "0.1.0",
    [
        InitWorkingDirectoryNode as any,
        ValidateNode as any,
        CoreFSCopyNode as any,
        CoreFSListDirectoryNode as any,
        CoreFSReadFileNode as any,
        CoreFSWriteFileNode as any,
    ],
    "HAMI Core File System Plugin",
);

export { CoreFSPlugin };
