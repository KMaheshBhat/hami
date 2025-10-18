import { Node } from "pocketflow";

import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from "@hami/core";
import assert from "assert";

interface TraceShowFlowConfig {
    coreFSStrategy: string;
    verbose: boolean;
    traceId: string;
}

const TraceShowFlowConfigSchema: ValidationSchema = {
    type: 'object',
    properties: {
        coreFSStrategy: {
            type: 'string',
        },
        verbose: {
            type: 'boolean',
        },
        traceId: {
            type: 'string',
        },
    },
    required: ['coreFSStrategy', 'verbose', 'traceId'],
}

export class TraceShowFlow extends HAMIFlow<Record<string, any>, TraceShowFlowConfig> {
    startNode: Node;
    config: TraceShowFlowConfig;

    constructor(config: TraceShowFlowConfig) {
        const startNode = new Node();
        super(startNode, config)
        this.startNode = startNode;
        this.config = config;
    }

    kind(): string {
        return 'hami-cli:trace-show-flow';
    }

    async run(shared: Record<string, any>): Promise<string | undefined> {
        assert(shared.registry, 'registry is required');
        const validate = shared['registry'].createNode("core-fs:validate-hami", {});
        validate
            .on('error', shared['registry'].createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
        const showTrace = shared['registry'].createNode("core-trace-fs:show", {});
        const logTrace = shared['registry'].createNode("core:log-result", {
            resultKey: "traceData",
            format: "json",
            prefix: "Trace data:",
            includeTimestamp: true,
            verbose: this.config.verbose
        });
        this.startNode
            .next(validate)
            .next(showTrace)
            .next(logTrace);
        return super.run(shared);
    }

    validateConfig(config: TraceShowFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(config, TraceShowFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}