import { Node } from "pocketflow";

import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from "@hami/core";
import assert from "assert";

interface FlowListFlowConfig {
    coreFSStrategy: string;
    target: string;
    verbose: boolean;
}

const FlowListFlowConfigSchema: ValidationSchema = {
    type: 'object',
    properties: {
        coreFSStrategy: {
            type: 'string',
        },
        target: {
            type: 'string',
        },
        verbose: {
            type: 'boolean',
        },
    },
    required: ['coreFSStrategy', 'target', 'verbose'],
}

export class FlowListFlow extends HAMIFlow<Record<string, any>, FlowListFlowConfig> {
    startNode: Node;
    config: FlowListFlowConfig;

    constructor(config: FlowListFlowConfig) {
        const startNode = new Node();
        super(startNode, config)
        this.startNode = startNode;
        this.config = config;
    }

    kind(): string {
        return 'hami-cli:flow-list-flow';
    }

    async run(shared: Record<string, any>): Promise<string | undefined> {
        assert(shared.registry, 'registry is required');
        const validate = shared['registry'].createNode("core-fs:validate-hami", {});
        validate
            .on('error', shared['registry'].createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
        const getAllConfig = shared['registry'].createNode("core-config-fs:get-all", {});
        const filterFlows = new FilterFlowsNode();
        const logFlows = shared['registry'].createNode("core:log-result", {
            resultKey: "flowConfigs",
            format: "table",
            prefix: "Configured flows:",
            emptyMessage: "No flows configured.",
            verbose: this.config.verbose
        });
        this.startNode
            .next(validate)
            .next(getAllConfig)
            .next(filterFlows)
            .next(logFlows);
        return super.run(shared);
    }

    validateConfig(config: FlowListFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(config, FlowListFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}

class FilterFlowsNode extends Node {
    async prep(shared: Record<string, any>): Promise<any | undefined> {
        return shared.configValues;
    }

    async exec(prepRes: any | undefined): Promise<Record<string, any>> {
        if (prepRes) {
            // Filter for flow keys and transform the output
            const flowConfigs: Record<string, any> = {};
            Object.keys(prepRes).forEach(key => {
                if (key.startsWith('flow:')) {
                    const flowName = key.substring(5); // Remove 'flow:' prefix
                    flowConfigs[flowName] = prepRes[key];
                }
            });
            return flowConfigs;
        } else {
            return {};
        }
    }

    async post(
        shared: Record<string, any>,
        _prepRes: unknown,
        execRes: unknown,
    ): Promise<string | undefined> {
        shared.flowConfigs = execRes;
        return 'default';
    }
}