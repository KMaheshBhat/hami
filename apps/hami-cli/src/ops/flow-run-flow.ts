import { Node } from "pocketflow";

import { HAMIFlow, HAMINodeConfigValidateResult, validateAgainstSchema, ValidationSchema } from "@hami/core";
import assert from "assert";

interface FlowRunFlowConfig {
    coreFSStrategy: string;
    target: string;
    name: string;
    verbose: boolean;
    payload?: Record<string, any>;
}

const FlowRunFlowConfigSchema: ValidationSchema = {
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
        verbose: {
            type: 'boolean',
        },
        payload: {
            type: 'any',
        },
    },
    required: ['coreFSStrategy', 'target', 'name', 'verbose'],
}

export class FlowRunFlow extends HAMIFlow<Record<string, any>, FlowRunFlowConfig> {
    startNode: Node;
    config: FlowRunFlowConfig;

    constructor(config: FlowRunFlowConfig) {
        const startNode = new Node();
        super(startNode, config)
        this.startNode = startNode;
        this.config = config;
    }

    kind(): string {
        return 'hami-cli:flow-run-flow';
    }

    async run(shared: Record<string, any>): Promise<string | undefined> {
        assert(shared.registry, 'registry is required');
        const validate = shared['registry'].createNode("core-fs:validate-hami", {});
        validate
            .on('error', shared['registry'].createNode('core:log-error', { errorKey: 'directoryValidationErrors' }))
        const getConfig = shared['registry'].createNode("core-config-fs:get", {});
        const runner = shared['registry'].createNode('core:dynamic-runner-flow', { runnerConfigValueKey: 'configValue' });
        runner
            .on('error', shared['registry'].createNode('core:log-error', { errorKey: 'dynamicRunnerError' }));
        const traceInject = shared['registry'].createNode("core-trace-fs:inject", {
            executor: 'cli',
            command: 'flow',
            operation: 'run',
            target: this.config.target,
            name: `flow:${this.config.name}`,
        });
        const traceLog = shared['registry'].createNode("core-trace-fs:log", {});
        const logResults = shared['registry'].createNode("core:log-result", {
            resultKey: "results",
            format: "table",
            prefix: "Flow execution results:",
            includeTimestamp: true,
            verbose: this.config.verbose
        });
        this.startNode
            .next(validate)
            .next(getConfig)
            .next(runner)
            .next(traceInject)
            .next(traceLog)
            .next(logResults);
        return super.run(shared);
    }

    validateConfig(config: FlowRunFlowConfig): HAMINodeConfigValidateResult {
        const result = validateAgainstSchema(config, FlowRunFlowConfigSchema);
        return {
            valid: result.isValid,
            errors: result.errors || [],
        };
    }
}