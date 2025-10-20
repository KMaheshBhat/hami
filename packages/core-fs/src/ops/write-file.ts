import assert from 'assert';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

import { HAMINode, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from '@hami/core';

import { CoreFSOpts, CoreFSSharedStorage } from '../types.js';

type CoreFSWriteFileNodeConfig = {
  path?: string;
  encoding?: string;
};

const CoreFSWriteFileNodeConfigSchema: ValidationSchema = {
  type: 'object',
  properties: {
    path: { type: 'string' },
    encoding: { type: 'string', default: 'utf8' },
  },
};

type WriteFileNodeInput = {
  path: string;
  content: string;
  encoding: string;
  workingDirectory: string;
  opts?: CoreFSOpts;
};

type WriteFileNodeOutput = string;

class CoreFSWriteFileNode extends HAMINode<CoreFSSharedStorage, CoreFSWriteFileNodeConfig> {
  kind(): string {
    return "core-fs:write-file";
  }

  validateConfig(config: CoreFSWriteFileNodeConfig): HAMINodeConfigValidateResult {
    const result = validateAgainstSchema(config, CoreFSWriteFileNodeConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }

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