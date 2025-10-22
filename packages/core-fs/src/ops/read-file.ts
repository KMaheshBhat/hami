import assert from 'assert';
import { readFileSync } from 'fs';
import { join } from 'path';

import { HAMINode, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from '@hami-frameworx/core';

import { CoreFSOpts, CoreFSSharedStorage } from '../types.js';

/**
 * Configuration interface for the CoreFSReadFileNode.
 * Defines the file path and encoding options for reading file contents.
 */
type CoreFSReadFileNodeConfig = {
  path?: string;
  encoding?: string;
};

/**
 * Validation schema for CoreFSReadFileNodeConfig.
 * Ensures that the configuration contains a required path and optional encoding with a default.
 */
const CoreFSReadFileNodeConfigSchema: ValidationSchema = {
  type: 'object',
  properties: {
    path: { type: 'string' },
    encoding: { type: 'string', default: 'utf8' },
  },
  required: ['path'],
};

/**
 * Input type for the read file operation.
 * Contains the resolved file path, encoding, working directory, and options.
 */
type ReadFileNodeInput = {
  path: string;
  encoding: string;
  workingDirectory: string;
  opts?: CoreFSOpts;
};

/**
 * Output type for the read file operation.
 * The string content of the file.
 */
type ReadFileNodeOutput = string;

/**
 * CoreFSReadFileNode is a core file system operation node that reads the contents of a file.
 * It extends HAMINode and is used for file reading operations in HAMI workflows.
 *
 * Configuration:
 * - `path`: The file path to read (relative to working directory, required).
 * - `encoding` (optional): The encoding to use when reading the file (defaults to 'utf8').
 *
 * Expected shared state inputs:
 * - `shared.workingDirectory`: The base working directory for resolving relative paths.
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.content`: The string content of the read file.
 */
class CoreFSReadFileNode extends HAMINode<CoreFSSharedStorage, CoreFSReadFileNodeConfig> {
  /**
   * Returns the kind identifier for this node, which is 'core-fs:read-file'.
   * @returns The string 'core-fs:read-file'.
   */
  kind(): string {
    return "core-fs:read-file";
  }

  /**
   * Validates the provided configuration against the schema.
   * Checks that path is present and is a string, with optional encoding validation.
   * @param config The configuration object to validate.
   * @returns An object indicating if the config is valid and any validation errors.
   */
  validateConfig(config: CoreFSReadFileNodeConfig): HAMINodeConfigValidateResult {
    const result = validateAgainstSchema(config, CoreFSReadFileNodeConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }

  /**
   * Prepares the input parameters for the file reading operation.
   * Merges configuration from node config and shared state, resolves the file path,
   * and sets up the encoding and options. Asserts that a path is provided.
   * @param shared The shared data object containing working directory and options.
   * @returns A promise that resolves to the prepared input parameters.
   */
  async prep(
    shared: CoreFSSharedStorage,
  ): Promise<ReadFileNodeInput> {
    const {
      path,
      encoding = 'utf8',
    } = {
      ...this.config,
      ...shared,
    };
    assert(path, "path is required");
    return {
      path: join(shared.workingDirectory || process.cwd(), path),
      encoding,
      workingDirectory: shared.workingDirectory || process.cwd(),
      opts: shared.opts,
    };
  }

  /**
   * Executes the file reading operation by synchronously reading the file contents.
   * Uses the specified encoding and logs verbose output if enabled.
   * @param params The prepared input parameters containing file path, encoding, and options.
   * @returns A promise that resolves to the string content of the file.
   */
  async exec(
    params: ReadFileNodeInput,
  ): Promise<ReadFileNodeOutput> {
    const { path, encoding, opts } = params;
    const verbose = !!opts?.verbose;

    const content = readFileSync(path, { encoding: encoding as BufferEncoding });

    verbose && console.log(`Read file: ${path}`);

    return content;
  }

  /**
   * Handles post-execution logic by storing the file content in the shared state.
   * Sets the content property in shared storage for use by subsequent nodes.
   * @param shared The shared data object to update with the file content.
   * @param _prepRes The prepared input parameters (unused in this implementation).
   * @param execRes The execution result containing the file content string.
   * @returns A promise that resolves to 'default' to continue normal flow.
   */
  async post(
    shared: CoreFSSharedStorage,
    _prepRes: ReadFileNodeInput,
    execRes: ReadFileNodeOutput,
  ): Promise<string | undefined> {
    shared.content = execRes;
    return "default";
  }
}

export {
  CoreFSReadFileNode,
};