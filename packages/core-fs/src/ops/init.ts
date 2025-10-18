
import assert from 'assert';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import { HAMINode, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from '@hami/core';

import { CoreFSOpts, CoreFSSharedStorage } from '../types.js';

type InitWorkingDirectoryNodeConfig = {
  strategy?: string;
};

const InitWorkingDirectoryNodeConfigSchema : ValidationSchema = {
  type: 'object',
  properties: {
    strategy: {
      type: 'string',
      enum: ['CWD'],
    },
  },
};

type InitWorkingDirectoryNodeInput = {
  targetDirectory?: string;
  opts?: CoreFSOpts;
};

type InitWorkingDirectoryNodeOutput = {
  workingDirectory?: string;
  hamiDirectory?: string;
  userHomeDirectory?: string;
  userHamiDirectory?: string;
};

class InitWorkingDirectoryNode extends HAMINode<CoreFSSharedStorage, InitWorkingDirectoryNodeConfig> {
  kind(): string {
    return "core-fs:init-hami";
  }

  validateConfig(config: InitWorkingDirectoryNodeConfig): HAMINodeConfigValidateResult {
    const result = validateAgainstSchema(config, InitWorkingDirectoryNodeConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }

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