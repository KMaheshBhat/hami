import assert from 'assert';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

import { HAMINode, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from '@hami-frameworx/core';

import { CoreFSOpts, CoreFSSharedStorage } from '../types.js';

/**
 * Configuration interface for the CoreFSListDirectoryNode.
 * Defines the directory path and recursion options for listing directory contents.
 */
type CoreFSListDirectoryNodeConfig = {
  path?: string;
  recursive?: boolean;
};

/**
 * Validation schema for CoreFSListDirectoryNodeConfig.
 * Ensures that the configuration contains optional path and recursive properties with defaults.
 */
const CoreFSListDirectoryNodeConfigSchema: ValidationSchema = {
  type: 'object',
  properties: {
    path: { type: 'string', default: '.' },
    recursive: { type: 'boolean', default: false },
  },
};

/**
 * Input type for the list directory operation.
 * Contains the resolved path, recursion flag, working directory, and options.
 */
type ListDirectoryNodeInput = {
  path: string;
  recursive: boolean;
  workingDirectory: string;
  opts?: CoreFSOpts;
};

/**
 * Output type for the list directory operation.
 * An array of directory items with metadata including name, path, type, size, and modification date.
 */
type ListDirectoryNodeOutput = Array<{ name: string, path: string, type: 'file' | 'directory', size?: number, modified?: Date }>;

/**
 * CoreFSListDirectoryNode is a core file system operation node that lists the contents of a directory.
 * It extends HAMINode and is used for directory listing operations in HAMI workflows.
 *
 * Configuration:
 * - `path` (optional): The directory path to list (relative to working directory, defaults to '.').
 * - `recursive` (optional): Whether to list contents recursively (defaults to false).
 *
 * Expected shared state inputs:
 * - `shared.workingDirectory`: The base working directory for resolving relative paths.
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.listDirectoryItems`: An array of directory items with metadata including name, path, type, size, and modification date.
 */
class CoreFSListDirectoryNode extends HAMINode<CoreFSSharedStorage, CoreFSListDirectoryNodeConfig> {
  /**
   * Returns the kind identifier for this node, which is 'core-fs:list-directory'.
   * @returns The string 'core-fs:list-directory'.
   */
  kind(): string {
    return "core-fs:list-directory";
  }

  /**
   * Validates the provided configuration against the schema.
   * Checks that path is a string and recursive is a boolean with appropriate defaults.
   * @param config The configuration object to validate.
   * @returns An object indicating if the config is valid and any validation errors.
   */
  validateConfig(config: CoreFSListDirectoryNodeConfig): HAMINodeConfigValidateResult {
    const result = validateAgainstSchema(config, CoreFSListDirectoryNodeConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }

  /**
   * Prepares the input parameters for the directory listing operation.
   * Merges configuration from node config and shared state, resolves the directory path,
   * and sets up the working directory and options.
   * @param shared The shared data object containing working directory and options.
   * @returns A promise that resolves to the prepared input parameters.
   */
  async prep(
    shared: CoreFSSharedStorage,
  ): Promise<ListDirectoryNodeInput> {
    const {
      path = '.',
      recursive = false,
    } = {
      ...this.config,
      ...shared,
    };
    return {
      path: join(shared.workingDirectory || process.cwd(), path),
      recursive,
      workingDirectory: shared.workingDirectory || process.cwd(),
      opts: shared.opts,
    };
  }

  /**
   * Executes the directory listing operation by reading the directory contents synchronously.
   * Supports recursive listing and collects metadata for each item including name, path, type, size, and modification date.
   * Handles errors for non-existent directories and logs verbose output if enabled.
   * @param params The prepared input parameters containing path, recursive flag, and options.
   * @returns A promise that resolves to an array of directory items with metadata.
   */
  async exec(
    params: ListDirectoryNodeInput,
  ): Promise<ListDirectoryNodeOutput> {
    const { path, recursive, opts } = params;
    const verbose = !!opts?.verbose;

    const items: Array<{ name: string, path: string, type: 'file' | 'directory', size?: number, modified?: Date }> = [];

    function listDir(dirPath: string, relativePath: string = '') {
      try {
        const entries = readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(dirPath, entry.name);
          const currentRelativePath = join(relativePath, entry.name);
          const stats = statSync(fullPath);
          const item = {
            name: entry.name,
            path: currentRelativePath,
            type: entry.isDirectory() ? 'directory' : 'file' as 'file' | 'directory',
            size: entry.isFile() ? stats.size : undefined,
            modified: stats.mtime
          };
          items.push(item);
          if (recursive && entry.isDirectory()) {
            listDir(fullPath, currentRelativePath);
          }
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          throw new Error(`Directory does not exist: ${dirPath}`);
        }
        throw error;
      }
    }

    listDir(path);

    verbose && console.log(`Listed ${items.length} items in directory: ${path}`);

    return items;
  }

  /**
   * Handles post-execution logic by storing the directory listing results in the shared state.
   * Sets the listDirectoryItems property in shared storage for use by subsequent nodes.
   * @param shared The shared data object to update with results.
   * @param _prepRes The prepared input parameters (unused in this implementation).
   * @param execRes The execution results containing the directory items array.
   * @returns A promise that resolves to 'default' to continue normal flow.
   */
  async post(
    shared: CoreFSSharedStorage,
    _prepRes: ListDirectoryNodeInput,
    execRes: ListDirectoryNodeOutput,
  ): Promise<string | undefined> {
    shared.listDirectoryItems = execRes;
    return "default";
  }
}

export {
  CoreFSListDirectoryNode,
};