import { Node } from "pocketflow";

import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from "@hami/core";
import assert from "assert";

interface ConfigGetFlowConfig {
    coreFSStrategy: string;
    verbose: boolean;
}

const ConfigGetFlowConfigSchema: ValidationSchema = {
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

export class ConfigGetFlow extends HAMIFlow<Record<string, any>, ConfigGetFlowConfig> {
    startNode: Node;
    config: ConfigGetFlowConfig;

    constructor(config: ConfigGetFlowConfig) {
        const startNode = new Node();
        super(startNode, config)
        this.startNode = startNode;
        this.config = config;
    }

    kind(): string {
        return 'hami-cli:config-get-flow';
    }

    async run(shared: Record<string, any>): Promise<string | undefined> {
        assert(shared.registry, 'registry is required');
        const validate = shared['registry'].createNode("core-fs:validate-hami", {});
        validate
            .on('error', shared['registry'].createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
        const getConfig = shared['registry'].createNode("core-config-fs:get", {});
        const logConfig = shared['registry'].createNode("core:log-result", {
            resultKey: "configValue",
            format: "generic",
            prefix: "Configuration value:",
            emptyMessage: "Configuration key not found.",
            verbose: this.config.verbose
        });
        this.startNode
            .next(validate)
            .next(getConfig)
            .next(logConfig);
        return super.run(shared);
    }

    validateConfig(config: ConfigGetFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(config, ConfigGetFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}