import { Node } from "pocketflow";

import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from "@hami/core";
import assert from "assert";

interface TraceListFlowConfig {
    coreFSStrategy: string;
    verbose: boolean;
}

const TraceListFlowConfigSchema: ValidationSchema = {
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

export class TraceListFlow extends HAMIFlow<Record<string, any>, TraceListFlowConfig> {
    startNode: Node;
    config: TraceListFlowConfig;

    constructor(config: TraceListFlowConfig) {
        const startNode = new Node();
        super(startNode, config)
        this.startNode = startNode;
        this.config = config;
    }

    kind(): string {
        return 'hami-cli:trace-list-flow';
    }

    async run(shared: Record<string, any>): Promise<string | undefined> {
        assert(shared.registry, 'registry is required');
        const validate = shared['registry'].createNode("core-fs:validate-hami", {});
        validate
            .on('error', shared['registry'].createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
        const listTraces = shared['registry'].createNode("core-trace-fs:list", {});
        const logTraces = shared['registry'].createNode("core:log-result", {
            resultKey: "traceResults",
            format: "table",
            prefix: "Trace entries:",
            emptyMessage: "No trace entries found.",
            verbose: this.config.verbose
        });
        this.startNode
            .next(validate)
            .next(listTraces)
            .next(logTraces);
        return super.run(shared);
    }

    validateConfig(config: TraceListFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(config, TraceListFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}