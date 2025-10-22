import { Node } from "pocketflow";

import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from "@hami-frameworx/core";
import assert from "assert";

interface ConfigSetFlowConfig {
    coreFSStrategy: string;
    target: string;
    configKey: string;
    configValue: any;
}

const ConfigSetFlowConfigSchema: ValidationSchema = {
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
        configValue: {
            type: 'any',
        },
    },
    required: ['coreFSStrategy', 'target', 'configKey', 'configValue'],
}

export class ConfigSetFlow extends HAMIFlow<Record<string, any>, ConfigSetFlowConfig> {
    startNode: Node;
    config: ConfigSetFlowConfig;

    constructor(config: ConfigSetFlowConfig) {
        const startNode = new Node();
        super(startNode, config)
        this.startNode = startNode;
        this.config = config;
    }

    kind(): string {
        return 'hami-cli:config-set-flow';
    }

    async run(shared: Record<string, any>): Promise<string | undefined> {
        assert(shared.registry, 'registry is required');
        const validate = shared['registry'].createNode("core-fs:validate-hami", {});
        validate
            .on('error', shared['registry'].createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
        const traceInject = shared['registry'].createNode("core-trace-fs:inject", {
            executor: 'cli',
            command: 'config',
            operation: 'set',
            target: this.config.target,
            key: this.config.configKey,
            value: this.config.configValue,
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

    validateConfig(config: ConfigSetFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(config, ConfigSetFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}