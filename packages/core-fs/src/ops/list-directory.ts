import assert from 'assert';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

import { HAMINode, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from '@hami/core';

import { CoreFSOpts, CoreFSSharedStorage } from '../types.js';

type CoreFSListDirectoryNodeConfig = {
  path?: string;
  recursive?: boolean;
};

const CoreFSListDirectoryNodeConfigSchema: ValidationSchema = {
  type: 'object',
  properties: {
    path: { type: 'string', default: '.' },
    recursive: { type: 'boolean', default: false },
  },
};

type ListDirectoryNodeInput = {
  path: string;
  recursive: boolean;
  workingDirectory: string;
  opts?: CoreFSOpts;
};

type ListDirectoryNodeOutput = Array<{ name: string, path: string, type: 'file' | 'directory', size?: number, modified?: Date }>;

class CoreFSListDirectoryNode extends HAMINode<CoreFSSharedStorage, CoreFSListDirectoryNodeConfig> {
  kind(): string {
    return "core-fs:list-directory";
  }

  validateConfig(config: CoreFSListDirectoryNodeConfig): HAMINodeConfigValidateResult {
    const result = validateAgainstSchema(config, CoreFSListDirectoryNodeConfigSchema);
    return {
      valid: result.isValid,
      errors: result.errors || [],
    };
  }

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