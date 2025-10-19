import assert from 'assert';
import { readFileSync } from 'fs';
import { join } from 'path';

import { HAMINode, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from '@hami/core';

import { CoreFSOpts, CoreFSSharedStorage } from '../types.js';

type CoreFSReadFileNodeConfig = {
  path?: string;
  encoding?: string;
};

const CoreFSReadFileNodeConfigSchema: ValidationSchema = {
  type: 'object',
  properties: {
    path: { type: 'string' },
    encoding: { type: 'string', default: 'utf8' },
  },
  required: ['path'],
};

type ReadFileNodeInput = {
  path: string;
  encoding: string;
  workingDirectory: string;
  opts?: CoreFSOpts;
};

type ReadFileNodeOutput = string;

class CoreFSReadFileNode extends HAMINode<CoreFSSharedStorage, CoreFSReadFileNodeConfig> {
  kind(): string {
    return "core-fs:read-file";
  }

  validateConfig(config: CoreFSReadFileNodeConfig): HAMINodeConfigValidateResult {
    const result = validateAgainstSchema(config, CoreFSReadFileNodeConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }

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

  async exec(
    params: ReadFileNodeInput,
  ): Promise<ReadFileNodeOutput> {
    const { path, encoding, opts } = params;
    const verbose = !!opts?.verbose;

    const content = readFileSync(path, { encoding: encoding as BufferEncoding });

    verbose && console.log(`Read file: ${path}`);

    return content;
  }

  async post(
    shared: CoreFSSharedStorage,
    _prepRes: ReadFileNodeInput,
    execRes: ReadFileNodeOutput,
  ): Promise<string | undefined> {
    shared.readFileContent = execRes;
    return "default";
  }
}

export {
  CoreFSReadFileNode,
};