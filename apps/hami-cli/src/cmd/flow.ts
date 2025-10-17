import { Flow, Node } from "pocketflow";

import { HAMIRegistrationManager } from "@hami/core";

import { DynamicRunnerNode, startContext, LogErrorNode, LogResult, DynamicRunnerFlow, EnhancedLogResult } from "./common.js";

export interface FlowOptions {
    verbose: boolean;
    global?: boolean;
}

export async function handleFlowInit(
    registry: HAMIRegistrationManager,
    opts: FlowOptions,
    name: string,
    kind: string,
    config: Record<string, any>
): Promise<void> {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', new LogErrorNode("directoryValidationErrors"));
    const traceInject = registry.createNode("core-trace-fs:inject", {
        executor: 'cli',
        command: 'flow',
        operation: 'init',
        target: opts.global ? 'global' : 'local',
        key: `flow:${name}`,
        value: { kind, config },
    });
    const setConfig = registry.createNode("core-config-fs:set", {});
    const traceLog = registry.createNode("core-trace-fs:log", {});
    validate
        .next(traceInject)
        .next(setConfig)
        .next(traceLog);
    const flow = new Flow(validate);
    await flow.run({
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        target: opts.global ? 'global' : 'local',
        configKey: `flow:${name}`,
        configValue: { kind, config },
    });
}

export async function handleFlowRun(
    registry: HAMIRegistrationManager,
    opts: FlowOptions,
    name: string,
    payload?: Record<string, any>
): Promise<void> {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', new LogErrorNode("directoryValidationErrors"))
    const getConfig = registry.createNode("core-config-fs:get", {});
    const runner = new DynamicRunnerFlow({ runnerConfigValueKey: 'configValue' });
    runner
        .on('error', new LogErrorNode("dynamicRunnerError"));
    const traceInject = registry.createNode("core-trace-fs:inject", {
        executor: 'cli',
        command: 'flow',
        operation: 'run',
        target: opts.global ? 'global' : 'local',
        name: `flow:${name}`,
    });
    const traceLog = registry.createNode("core-trace-fs:log", {});
    const logResults = new EnhancedLogResult({
        resultKey: "results",
        format: "table",
        prefix: "Flow execution results:",
        includeTimestamp: true,
        verbose: opts.verbose
    });
    validate
        .next(getConfig)
        .next(runner)
        .next(traceInject)
        .next(traceLog)
        .next(logResults);
    const flow = new Flow(validate);
    await flow.run({
        registry: registry,
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        target: opts.global ? 'global' : 'local',
        configKey: `flow:${name}`,
        ...payload,
    });
}

export async function handleFlowRemove(
    registry: HAMIRegistrationManager,
    opts: FlowOptions,
    name: string
): Promise<void> {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', new LogErrorNode("directoryValidationErrors"));
    const traceInject = registry.createNode("core-trace-fs:inject", {
        executor: 'cli',
        command: 'flow',
        operation: 'remove',
        target: opts.global ? 'global' : 'local',
        key: `flow:${name}`,
    });
    const removeConfig = registry.createNode("core-config-fs:remove", {});
    const traceLog = registry.createNode("core-trace-fs:log", {});
    validate
        .next(traceInject)
        .next(removeConfig)
        .next(traceLog);
    const flow = new Flow(validate);
    await flow.run({
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        target: opts.global ? 'global' : 'local',
        configKey: `flow:${name}`,
    });
}

export class FilterFlowsNode extends Node {
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

export async function handleFlowList(
    registry: HAMIRegistrationManager,
    opts: FlowOptions
): Promise<void> {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', new LogErrorNode("directoryValidationErrors"));
    const getAllConfig = registry.createNode("core-config-fs:get-all", {});
    const filterFlows = new FilterFlowsNode();
    const logFlows = new EnhancedLogResult({
        resultKey: "flowConfigs",
        format: "table",
        prefix: "Configured flows:",
        emptyMessage: "No flows configured.",
        verbose: opts.verbose
    });
    validate
        .next(getAllConfig)
        .next(filterFlows)
        .next(logFlows);
    const flow = new Flow(validate);
    await flow.run({
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        target: opts.global ? 'global' : 'local',
    });
}