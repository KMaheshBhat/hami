import assert from 'assert';
import { sync as globSync } from 'glob';
import { promises as fs } from 'fs';
import { join, dirname, relative } from 'path';

import { HAMINode, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from '@hami-frameworx/core';

import { CoreFSOpts, CoreFSSharedStorage } from '../types.js';

/**
 * Configuration interface for the CoreFSCopyNode.
 * Defines the source pattern and target directory for copying files.
 */
type CoreFSCopyNodeConfig = {
  sourcePattern?: string;
  targetDirectory?: string;
};

/**
 * Validation schema for CoreFSCopyNodeConfig.
 * Ensures that the configuration contains required sourcePattern and targetDirectory as strings.
 */
const CoreFSCopyNodeConfigSchema : ValidationSchema = {
  type: 'object',
  properties: {
    sourcePattern: { type: 'string' },
    targetDirectory: { type: 'string' },
  },
  required: ['sourcePattern', 'targetDirectory'],
};

/**
 * Input type for the copy operation.
 * Contains the source pattern, target directory, working directory, and options.
 */
type CopyNodeInput = {
  sourcePattern: string;
  targetDirectory: string;
  workingDirectory: string;
  opts?: CoreFSOpts;
};

/**
 * Output type for the copy operation.
 * An array of strings representing the paths of successfully copied files.
 */
type CopyNodeOutput = string[];

/**
 * CoreFSCopyNode is a core file system operation node that copies files matching a pattern to a target directory.
 * It extends HAMINode and is used for file copying operations in HAMI workflows.
 * Supports glob patterns for source files and automatically creates target directories.
 *
 * Configuration:
 * - `sourcePattern`: A glob pattern to match source files (required).
 * - `targetDirectory`: The directory to copy files to (required).
 *
 * Expected shared state inputs:
 * - `shared.workingDirectory`: The base working directory for resolving relative paths.
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.copyResults`: An array of strings containing the paths of successfully copied files.
 */
class CoreFSCopyNode extends HAMINode<CoreFSSharedStorage, CoreFSCopyNodeConfig> {
  /**
   * Returns the kind identifier for this node, which is 'core-fs:copy'.
   * @returns The string 'core-fs:copy'.
   */
  kind(): string {
    return "core-fs:copy";
  }

  /**
   * Validates the provided configuration against the schema.
   * Checks that sourcePattern and targetDirectory are present and are strings.
   * @param config The configuration object to validate.
   * @returns An object indicating if the config is valid and any validation errors.
   */
  validateConfig(config: CoreFSCopyNodeConfig): HAMINodeConfigValidateResult {
    const result = validateAgainstSchema(config, CoreFSCopyNodeConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }

  /**
   * Prepares the input parameters for the file copying operation.
   * Merges configuration from node config and shared state, and asserts that
   * both sourcePattern and targetDirectory are provided.
   * @param shared The shared data object containing working directory and options.
   * @returns A promise that resolves to the prepared input parameters.
   */
  async prep(
    shared: CoreFSSharedStorage,
  ): Promise<CopyNodeInput> {
    const {
      sourcePattern,
      targetDirectory,
    } = {
      ...this.config,
      ...shared,
    };
    assert(sourcePattern, "sourcePattern is required");
    assert(targetDirectory, "targetDirectory is required");
    return {
      sourcePattern,
      targetDirectory,
      workingDirectory: shared.workingDirectory || process.cwd(),
      opts: shared.opts,
    };
  }

  /**
   * Executes the file copying operation by finding files matching the glob pattern
   * and copying them to the target directory while preserving relative paths.
   * Creates target directories recursively as needed and logs verbose output if enabled.
   * @param params The prepared input parameters containing source pattern, target directory, and options.
   * @returns A promise that resolves to an array of paths for successfully copied files.
   */
  async exec(
    params: CopyNodeInput,
  ): Promise<CopyNodeOutput> {
    const { sourcePattern, targetDirectory, workingDirectory, opts } = params;
    const verbose = !!opts?.verbose;

    const files = globSync(sourcePattern, { cwd: workingDirectory });
    const copied: string[] = [];

    for (const file of files) {
      const relativePath = relative(workingDirectory, file);
      const targetPath = join(targetDirectory, relativePath);

      await fs.mkdir(dirname(targetPath), { recursive: true });
      await fs.copyFile(file, targetPath);

      copied.push(targetPath);
      verbose && console.log(`Copied ${file} to ${targetPath}`);
    }

    return copied;
  }

  /**
   * Handles post-execution logic by storing the copy results in the shared state.
   * Sets the copyResults property in shared storage for use by subsequent nodes.
   * @param shared The shared data object to update with the copy results.
   * @param _prepRes The prepared input parameters (unused in this implementation).
   * @param execRes The execution result containing the array of copied file paths.
   * @returns A promise that resolves to 'default' to continue normal flow.
   */
  async post(
    shared: CoreFSSharedStorage,
    _prepRes: CopyNodeInput,
    execRes: CopyNodeOutput,
  ): Promise<string | undefined> {
    shared.copyResults = execRes;
    return "default";
  }
}

export {
  CoreFSCopyNode,
};