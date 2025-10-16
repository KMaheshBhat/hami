import assert from 'assert';
import { sync as globSync } from 'glob';
import { promises as fs } from 'fs';
import { join, dirname, relative } from 'path';

import { HAMIFlow, HAMINode, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from '@hami/core';

import { CoreFSOpts, CoreFSSharedStorage } from '../types.js';
import { CoreFSCopyNode } from './copy.js';


type CoreFSCopyFlowConfig = {
    sourcePattern?: string;
    targetDirectory?: string;
};

const CoreFSCopyFlowConfigSchema: ValidationSchema = {
    type: 'object',
    properties: {
        sourcePattern: { type: 'string' },
        targetDirectory: { type: 'string' },
    },
    required: ['sourcePattern', 'targetDirectory'],
};

class CoreFSCopyFlow extends HAMIFlow<CoreFSSharedStorage, CoreFSCopyFlowConfig> {
    kind(): string {
        return "core-fs:copy-flow";
    }
    
    constructor(config: CoreFSCopyFlowConfig) {
        const startNode = new CoreFSCopyNode(config);
        startNode.next(new CommonResultHandlerNode());
        super(startNode, config);
    }

    validateConfig(_config: CoreFSCopyFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(_config, CoreFSCopyFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}

class CommonResultHandlerNode extends HAMINode<CoreFSSharedStorage> {
    kind(): string {
        return "core-fs:common-result-handler";
    }
    async post(shared: CoreFSSharedStorage, prepRes: unknown, execRes: unknown): Promise<string | undefined> {
        shared.results = shared.copyResults;
        return 'default';
    }
}

export { CoreFSCopyFlow };