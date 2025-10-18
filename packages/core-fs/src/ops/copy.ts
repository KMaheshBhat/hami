import assert from 'assert';
import { sync as globSync } from 'glob';
import { promises as fs } from 'fs';
import { join, dirname, relative } from 'path';

import { HAMINode, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from '@hami/core';

import { CoreFSOpts, CoreFSSharedStorage } from '../types.js';

type CoreFSCopyNodeConfig = {
  sourcePattern?: string;
  targetDirectory?: string;
};

const CoreFSCopyNodeConfigSchema : ValidationSchema = {
  type: 'object',
  properties: {
    sourcePattern: { type: 'string' },
    targetDirectory: { type: 'string' },
  },
  required: ['sourcePattern', 'targetDirectory'],
};

type CopyNodeInput = {
  sourcePattern: string;
  targetDirectory: string;
  workingDirectory: string;
  opts?: CoreFSOpts;
};

type CopyNodeOutput = string[];

class CoreFSCopyNode extends HAMINode<CoreFSSharedStorage, CoreFSCopyNodeConfig> {
  kind(): string {
    return "core-fs:copy";
  }

  validateConfig(config: CoreFSCopyNodeConfig): HAMINodeConfigValidateResult {
    const result = validateAgainstSchema(config, CoreFSCopyNodeConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }

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