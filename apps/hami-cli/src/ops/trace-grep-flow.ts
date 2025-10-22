import { Node } from "pocketflow";

import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from "@hami-frameworx/core";
import assert from "assert";

interface TraceGrepFlowConfig {
    coreFSStrategy: string;
    verbose: boolean;
    searchQuery: string;
}

const TraceGrepFlowConfigSchema: ValidationSchema = {
    type: 'object',
    properties: {
        coreFSStrategy: {
            type: 'string',
        },
        verbose: {
            type: 'boolean',
        },
        searchQuery: {
            type: 'string',
        },
    },
    required: ['coreFSStrategy', 'verbose', 'searchQuery'],
}

export class TraceGrepFlow extends HAMIFlow<Record<string, any>, TraceGrepFlowConfig> {
    startNode: Node;
    config: TraceGrepFlowConfig;

    constructor(config: TraceGrepFlowConfig) {
        const startNode = new Node();
        super(startNode, config)
        this.startNode = startNode;
        this.config = config;
    }

    kind(): string {
        return 'hami-cli:trace-grep-flow';
    }

    async run(shared: Record<string, any>): Promise<string | undefined> {
        assert(shared.registry, 'registry is required');
        const validate = shared['registry'].createNode("core-fs:validate-hami", {});
        validate
            .on('error', shared['registry'].createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
        const grepTraces = shared['registry'].createNode("core-trace-fs:grep", {});
        const transformResults = new TransformTraceResultsNode();
        const logResults = shared['registry'].createNode("core:log-result", {
            resultKey: "transformedTraceResults",
            format: "table",
            prefix: "Trace search results:",
            emptyMessage: "No traces found matching the search query.",
            verbose: this.config.verbose
        });
        this.startNode
            .next(validate)
            .next(grepTraces)
            .next(transformResults as any)
            .next(logResults);
        return super.run(shared);
    }

    validateConfig(config: TraceGrepFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(config, TraceGrepFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}

class TransformTraceResultsNode extends Node {
    async prep(shared: Record<string, any>): Promise<any | undefined> {
        return shared.traceResults;
    }

    async exec(prepRes: any | undefined): Promise<Record<string, any>[]> {
        if (prepRes && prepRes.length > 0) {
            const tableData = prepRes.map((trace: any) => ({
                id: trace.id,
                timestamp: trace.timestamp,
                data: JSON.stringify(trace.data),
            }));
            return tableData;
        } else {
            return [];
        }
    }

    async post(shared: Record<string, any>, prepRes: any | undefined, execRes: Record<string, any>[]): Promise<string | undefined> {
        shared.transformedTraceResults = execRes;
        return 'default';
    }
}