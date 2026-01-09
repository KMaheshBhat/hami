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
        const n = shared.registry.createNode.bind(shared.registry);
        const validate = n("core-fs:validate-hami", {});
        validate
            .on('error', n('core:log-error', { errorKey: 'directoryValidationErrors' }));
        const getAllConfig = n("core-config-fs:get-all", {});
        const logConfig = n("core:log-result", {
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