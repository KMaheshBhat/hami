import { Node } from "pocketflow";

import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from "@hami-frameworx/core";
import assert from "assert";

interface ConfigRemoveFlowConfig {
    coreFSStrategy: string;
    target: string;
    configKey: string;
}

const ConfigRemoveFlowConfigSchema: ValidationSchema = {
    type: 'object',
    properties: {
        coreFSStrategy: {
            type: 'string',
        },
        target: {
            type: 'string',
        },
        configKey: {
            type: 'string',
        },
    },
    required: ['coreFSStrategy', 'target', 'configKey'],
}

export class ConfigRemoveFlow extends HAMIFlow<Record<string, any>, ConfigRemoveFlowConfig> {
    startNode: Node;
    config: ConfigRemoveFlowConfig;

    constructor(config: ConfigRemoveFlowConfig) {
        const startNode = new Node();
        super(startNode, config)
        this.startNode = startNode;
        this.config = config;
    }

    kind(): string {
        return 'hami-cli:config-remove-flow';
    }

    async run(shared: Record<string, any>): Promise<string | undefined> {
        assert(shared.registry, 'registry is required');
        const validate = shared['registry'].createNode("core-fs:validate-hami", {});
        validate
            .on('error', shared['registry'].createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
        const traceInject = shared['registry'].createNode("core-trace-fs:inject", {
            executor: 'cli',
            command: 'config',
            operation: 'remove',
            target: this.config.target,
            key: this.config.configKey,
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

    validateConfig(config: ConfigRemoveFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(config, ConfigRemoveFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}