
import assert from 'assert';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import { HAMINode, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from '@hami-frameworx/core';

import { CoreFSOpts, CoreFSSharedStorage } from '../types.js';

/**
 * Configuration interface for the InitWorkingDirectoryNode.
 * Defines the strategy for initializing the working directory.
 */
type InitWorkingDirectoryNodeConfig = {
  strategy?: string;
};

/**
 * Validation schema for InitWorkingDirectoryNodeConfig.
 * Ensures that the strategy is an optional string with allowed values.
 */
const InitWorkingDirectoryNodeConfigSchema : ValidationSchema = {
  type: 'object',
  properties: {
    strategy: {
      type: 'string',
      enum: ['CWD'],
    },
  },
};

/**
 * Input type for the init working directory operation.
 * Contains the target directory and options.
 */
type InitWorkingDirectoryNodeInput = {
  targetDirectory?: string;
  opts?: CoreFSOpts;
};

/**
 * Output type for the init working directory operation.
 * Contains the resolved directory paths for working directory, hami directory, user home, and user hami directory.
 */
type InitWorkingDirectoryNodeOutput = {
  workingDirectory?: string;
  hamiDirectory?: string;
  userHomeDirectory?: string;
  userHamiDirectory?: string;
};

/**
 * InitWorkingDirectoryNode is a core file system operation node that initializes the working directory
 * and creates necessary HAMI directories. It extends HAMINode and is used for setting up
 * the file system environment in HAMI workflows.
 *
 * Configuration:
 * - `strategy` (optional): The initialization strategy - currently only 'CWD' (current working directory) is supported.
 *
 * Expected shared state inputs:
 * - `shared.coreFSStrategy`: Alternative way to specify the strategy (defaults to 'CWD').
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.workingDirectory`: The resolved working directory path.
 * - `shared.hamiDirectory`: The path to the .hami directory in the working directory.
 * - `shared.userHomeDirectory`: The user's home directory path.
 * - `shared.userHamiDirectory`: The path to the .hami directory in the user's home directory.
 */
class InitWorkingDirectoryNode extends HAMINode<CoreFSSharedStorage, InitWorkingDirectoryNodeConfig> {
  /**
   * Returns the kind identifier for this node, which is 'core-fs:init-hami'.
   * @returns The string 'core-fs:init-hami'.
   */
  kind(): string {
    return "core-fs:init-hami";
  }

  /**
   * Validates the provided configuration against the schema.
   * Checks that strategy is an optional string with allowed enum values.
   * @param config The configuration object to validate.
   * @returns An object indicating if the config is valid and any validation errors.
   */
  validateConfig(config: InitWorkingDirectoryNodeConfig): HAMINodeConfigValidateResult {
    const result = validateAgainstSchema(config, InitWorkingDirectoryNodeConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }

  /**
   * Prepares the input parameters for the init operation.
   * Determines the working directory based on the configured strategy,
   * defaulting to the current working directory (CWD).
   * @param shared The shared data object containing strategy and options.
   * @returns A promise that resolves to the prepared input parameters.
   */
  async prep(
    shared: CoreFSSharedStorage,
  ): Promise<InitWorkingDirectoryNodeInput> {
    let workingDir;
    let strategy = this.config?.strategy || shared.coreFSStrategy;
    switch (strategy) {
      case 'CWD':
        workingDir = process.cwd();
        break;
      default:
        throw new Error(`Unknown core-fs strategy: ${shared.coreFSStrategy}`);
    }
    assert(workingDir, 'could not resolve working directory');
    return {
      targetDirectory: workingDir,
      opts: shared.opts,
    };
  }

  /**
   * Executes the init operation by creating the necessary .hami directories
   * in both the working directory and user home directory if they don't exist.
   * Logs verbose output about directory creation or existence.
   * @param params The prepared input parameters containing target directory and options.
   * @returns A promise that resolves to an object containing all resolved directory paths.
   */
  async exec(
    params: InitWorkingDirectoryNodeInput,
  ): Promise<InitWorkingDirectoryNodeOutput> {

    const workingDirectory = params.targetDirectory!;
    const hamiDirectory = join(workingDirectory, '.hami');
    const userHomeDirectory = homedir();
    const userHamiDirectory = join(userHomeDirectory, '.hami');
    const verbose = !!params?.opts?.verbose;

    try {
      await fs.access(hamiDirectory);
      verbose && console.log(`.hami directory already exists at ${hamiDirectory}`);
    } catch {
      await fs.mkdir(hamiDirectory);
      verbose && console.log(`.hami directory created at ${hamiDirectory}`);
    }

    try {
      await fs.access(userHamiDirectory);
      verbose && console.log(`.hami directory already exists at ${userHamiDirectory}`);
    } catch {
      await fs.mkdir(userHamiDirectory);
      verbose && console.log(`.hami directory created at ${userHamiDirectory}`);
    }

    return {
      workingDirectory,
      hamiDirectory,
      userHomeDirectory,
      userHamiDirectory,
    };
  }

  /**
   * Handles post-execution logic by storing all resolved directory paths in the shared state.
   * Sets workingDirectory, hamiDirectory, userHomeDirectory, and userHamiDirectory properties
   * for use by subsequent nodes.
   * @param shared The shared data object to update with directory paths.
   * @param _prepRes The prepared input parameters (unused in this implementation).
   * @param execRes The execution result containing all resolved directory paths.
   * @returns A promise that resolves to 'default' to continue normal flow.
   */
  async post(
    shared: CoreFSSharedStorage,
    _prepRes: InitWorkingDirectoryNodeInput,
    execRes: InitWorkingDirectoryNodeOutput,
  ): Promise<string | undefined> {
    shared.workingDirectory = execRes.workingDirectory;
    shared.hamiDirectory = execRes.hamiDirectory;
    shared.userHomeDirectory = execRes.userHomeDirectory;
    shared.userHamiDirectory = execRes.userHamiDirectory;
    return "default";
  }
}

export {
  InitWorkingDirectoryNode,
};