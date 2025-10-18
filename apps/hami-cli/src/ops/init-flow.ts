import { Node } from "pocketflow";

import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from "@hami/core";
import { CoreTraceFSInjectNode, CoreTraceFSLogNode } from "@hami/core-trace-fs";
import assert from "assert";

interface InitFlowConfig {
    coreFSStrategy: string;
}

const InitFlowConfigSchema: ValidationSchema = {
    type: 'object',
    properties: {
        coreFSStrategy: {
            type: 'string',
        },
    },
    required: ['coreFSStrategy'],
}

export class InitFlow extends HAMIFlow<Record<string, any>, InitFlowConfig> {
    startNode: Node;
    config: InitFlowConfig;

    constructor(config: InitFlowConfig) {
        const startNode = new Node();
        super(startNode, config)
        this.startNode = startNode;
        this.config = config;
    }

    kind(): string {
        return 'hami-cli:init-flow';
    }

    async run(shared: Record<string, any>): Promise<string | undefined> {
        assert(shared.registry, 'registry is required');
        const init = shared['registry'].createNode("core-fs:init-hami", {
            strategy: this.config.coreFSStrategy,
        });
        const traceInject = new CoreTraceFSInjectNode({
            executor: 'cli',
            command: 'init',
        });
        const traceLog = new CoreTraceFSLogNode();
        this.startNode
            .next(init)
            .next(traceInject)
            .next(traceLog);
        return super.run(shared);
    }

    validateConfig(config: InitFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(config, InitFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}