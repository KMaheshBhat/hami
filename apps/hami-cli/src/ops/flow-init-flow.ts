import { Node } from "pocketflow";

import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from "@hami-frameworx/core";
import assert from "assert";

interface FlowInitFlowConfig {
    coreFSStrategy: string;
    target: string;
    name: string;
    kind: string;
    config: Record<string, any>;
}

const FlowInitFlowConfigSchema: ValidationSchema = {
    type: 'object',
    properties: {
        coreFSStrategy: {
            type: 'string',
        },
        target: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        kind: {
            type: 'string',
        },
        config: {
            type: 'any',
        },
    },
    required: ['coreFSStrategy', 'target', 'name', 'kind', 'config'],
}

export class FlowInitFlow extends HAMIFlow<Record<string, any>, FlowInitFlowConfig> {
    startNode: Node;
    config: FlowInitFlowConfig;

    constructor(config: FlowInitFlowConfig) {
        const startNode = new Node();
        super(startNode, config)
        this.startNode = startNode;
        this.config = config;
    }

    kind(): string {
        return 'hami-cli:flow-init-flow';
    }

    async run(shared: Record<string, any>): Promise<string | undefined> {
        assert(shared.registry, 'registry is required');
        const validate = shared['registry'].createNode("core-fs:validate-hami", {});
        validate
            .on('error', shared['registry'].createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
        const traceInject = shared['registry'].createNode("core-trace-fs:inject", {
            executor: 'cli',
            command: 'flow',
            operation: 'init',
            target: this.config.target,
            key: `flow:${this.config.name}`,
            value: { kind: this.config.kind, config: this.config.config },
        });
        const setConfig = shared['registry'].createNode("core-config-fs:set", {});
        const traceLog = shared['registry'].createNode("core-trace-fs:log", {});
        this.startNode
            .next(validate)
            .next(traceInject)
            .next(setConfig)
            .next(traceLog);
        return super.run(shared);
    }

    validateConfig(config: FlowInitFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(config, FlowInitFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}