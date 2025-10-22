import { Node } from "pocketflow";

import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from "@hami-frameworx/core";
import assert from "assert";

interface ConfigListFlowConfig {
    coreFSStrategy: string;
    verbose: boolean;
}

const ConfigListFlowConfigSchema: ValidationSchema = {
    type: 'object',
    properties: {
        coreFSStrategy: {
            type: 'string',
        },
        verbose: {
            type: 'boolean',
        },
    },
    required: ['coreFSStrategy', 'verbose'],
}

export class ConfigListFlow extends HAMIFlow<Record<string, any>, ConfigListFlowConfig> {
    startNode: Node;
    config: ConfigListFlowConfig;

    constructor(config: ConfigListFlowConfig) {
        const startNode = new Node();
        super(startNode, config)
        this.startNode = startNode;
        this.config = config;
    }

    kind(): string {
        return 'hami-cli:config-list-flow';
    }

    async run(shared: Record<string, any>): Promise<string | undefined> {
        assert(shared.registry, 'registry is required');
        const validate = shared['registry'].createNode("core-fs:validate-hami", {});
        validate
            .on('error', shared['registry'].createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
        const getAllConfig = shared['registry'].createNode("core-config-fs:get-all", {});
        const logConfig = shared['registry'].createNode("core:log-result", {
            resultKey: "configValues",
            format: "table",
            prefix: "Configuration entries:",
            emptyMessage: "No configuration entries found.",
            verbose: this.config.verbose
        });
        this.startNode
            .next(validate)
            .next(getAllConfig)
            .next(logConfig);
        return super.run(shared);
    }

    validateConfig(config: ConfigListFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(config, ConfigListFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}