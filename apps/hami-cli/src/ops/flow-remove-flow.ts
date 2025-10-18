import { Node } from "pocketflow";

import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from "@hami/core";
import assert from "assert";

interface FlowRemoveFlowConfig {
    coreFSStrategy: string;
    target: string;
    name: string;
}

const FlowRemoveFlowConfigSchema: ValidationSchema = {
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
    },
    required: ['coreFSStrategy', 'target', 'name'],
}

export class FlowRemoveFlow extends HAMIFlow<Record<string, any>, FlowRemoveFlowConfig> {
    startNode: Node;
    config: FlowRemoveFlowConfig;

    constructor(config: FlowRemoveFlowConfig) {
        const startNode = new Node();
        super(startNode, config)
        this.startNode = startNode;
        this.config = config;
    }

    kind(): string {
        return 'hami-cli:flow-remove-flow';
    }

    async run(shared: Record<string, any>): Promise<string | undefined> {
        assert(shared.registry, 'registry is required');
        const validate = shared['registry'].createNode("core-fs:validate-hami", {});
        validate
            .on('error', shared['registry'].createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
        const traceInject = shared['registry'].createNode("core-trace-fs:inject", {
            executor: 'cli',
            command: 'flow',
            operation: 'remove',
            target: this.config.target,
            key: `flow:${this.config.name}`,
        });
        const removeConfig = shared['registry'].createNode("core-config-fs:remove", {});
        const traceLog = shared['registry'].createNode("core-trace-fs:log", {});
        this.startNode
            .next(validate)
            .next(traceInject)
            .next(removeConfig)
            .next(traceLog);
        return super.run(shared);
    }

    validateConfig(config: FlowRemoveFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(config, FlowRemoveFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}