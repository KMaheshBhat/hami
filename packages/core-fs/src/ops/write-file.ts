import assert from 'assert';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

import { HAMINode, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from '@hami-frameworx/core';

import { CoreFSOpts, CoreFSSharedStorage } from '../types.js';

/**
 * Configuration interface for the CoreFSWriteFileNode.
 * Defines the file path and encoding options for writing file contents.
 */
type CoreFSWriteFileNodeConfig = {
  path?: string;
  encoding?: string;
};

/**
 * Validation schema for CoreFSWriteFileNodeConfig.
 * Ensures that the configuration contains optional path and encoding with a default.
 */
const CoreFSWriteFileNodeConfigSchema: ValidationSchema = {
  type: 'object',
  properties: {
    path: { type: 'string' },
    encoding: { type: 'string', default: 'utf8' },
  },
};

/**
 * Input type for the write file operation.
 * Contains the resolved file path, content to write, encoding, working directory, and options.
 */
type WriteFileNodeInput = {
  path: string;
  content: string;
  encoding: string;
  workingDirectory: string;
  opts?: CoreFSOpts;
};

/**
 * Output type for the write file operation.
 * A confirmation message indicating the file was written successfully.
 */
type WriteFileNodeOutput = string;

/**
 * CoreFSWriteFileNode is a core file system operation node that writes content to a file.
 * It extends HAMINode and is used for file writing operations in HAMI workflows.
 * Automatically creates parent directories if they don't exist.
 *
 * Configuration:
 * - `path`: The file path to write to (relative to working directory, required).
 * - `encoding` (optional): The encoding to use when writing the file (defaults to 'utf8').
 *
 * Expected shared state inputs:
 * - `shared.workingDirectory`: The base working directory for resolving relative paths.
 * - `shared.content`: The string content to write to the file (defaults to empty string).
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.writeFileResult`: A confirmation message indicating the file was written successfully.
 */
class CoreFSWriteFileNode extends HAMINode<CoreFSSharedStorage, CoreFSWriteFileNodeConfig> {
  /**
   * Returns the kind identifier for this node, which is 'core-fs:write-file'.
   * @returns The string 'core-fs:write-file'.
   */
  kind(): string {
    return "core-fs:write-file";
  }

  /**
   * Validates the provided configuration against the schema.
   * Checks that path is present and is a string, with optional encoding validation.
   * @param config The configuration object to validate.
   * @returns An object indicating if the config is valid and any validation errors.
   */
  validateConfig(config: CoreFSWriteFileNodeConfig): HAMINodeConfigValidateResult {
    const result = validateAgainstSchema(config, CoreFSWriteFileNodeConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }

  /**
   * Prepares the input parameters for the file writing operation.
   * Merges configuration from node config and shared state, resolves the file path,
   * retrieves content from shared state, and sets up the encoding and options.
   * Asserts that a path is provided and uses empty string as default content.
   * @param shared The shared data object containing working directory, content, and options.
   * @returns A promise that resolves to the prepared input parameters.
   */
  async prep(
    shared: CoreFSSharedStorage,
  ): Promise<WriteFileNodeInput> {
    const {
      path,
      encoding = 'utf8',
    } = {
      ...this.config,
      ...shared,
    };
    assert(path, "path is required");
    const content = shared.content || '';
    return {
      path: join(shared.workingDirectory || process.cwd(), path),
      content,
      encoding,
      workingDirectory: shared.workingDirectory || process.cwd(),
      opts: shared.opts,
    };
  }

  /**
   * Executes the file writing operation by synchronously writing content to the file.
   * Creates parent directories recursively if they don't exist, uses the specified encoding,
   * and logs verbose output if enabled.
   * @param params The prepared input parameters containing file path, content, encoding, and options.
   * @returns A promise that resolves to a confirmation message indicating the file was written.
   */
  async exec(
    params: WriteFileNodeInput,
  ): Promise<WriteFileNodeOutput> {
    const { path, content, encoding, opts } = params;
    const verbose = !!opts?.verbose;

    // Ensure parent directories exist
    const dir = dirname(path);
    mkdirSync(dir, { recursive: true });

    writeFileSync(path, content, { encoding: encoding as BufferEncoding });

    verbose && console.log(`Wrote file: ${path}`);

    return `Wrote file: ${path}`;
  }

  /**
   * Handles post-execution logic by storing the write result in the shared state.
   * Sets the writeFileResult property in shared storage for use by subsequent nodes.
   * @param shared The shared data object to update with the write result.
   * @param _prepRes The prepared input parameters (unused in this implementation).
   * @param execRes The execution result containing the confirmation message.
   * @returns A promise that resolves to 'default' to continue normal flow.
   */
  async post(
    shared: CoreFSSharedStorage,
    _prepRes: WriteFileNodeInput,
    execRes: WriteFileNodeOutput,
  ): Promise<string | undefined> {
    shared.writeFileResult = execRes;
    return "default";
  }
}

export {
  CoreFSWriteFileNode,
};