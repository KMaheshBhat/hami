import { Flow } from "pocketflow";

import { HAMIRegistrationManager } from "@hami/core";

import { startContext, LogErrorNode } from "./common.js";

export async function handleConfigList(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', new LogErrorNode('directoryValidationErrors'));
    const getAllConfig = registry.createNode("core-config-fs:get-all", {});
    validate
        .next(getAllConfig);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        ...inPayload,
    };
    const flow = new Flow(validate);
    await flow.run(shared);
    if (shared.configValues) {
        console.table(shared.configValues);
    }
}

export async function handleConfigGet(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', new LogErrorNode('directoryValidationErrors'));
    const getConfig = registry.createNode("core-config-fs:get", {});
    validate
        .next(getConfig);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        ...inPayload,
    };
    const flow = new Flow(validate);
    await flow.run(shared);
    if (shared.configValue) {
        console.log(shared.configValue);
    }
}

export async function handleConfigSet(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', new LogErrorNode('directoryValidationErrors'));
    const traceInject = registry.createNode("core-trace-fs:inject", {
        executor: 'cli',
        command: 'config',
        operation: 'set',
        target: inPayload.target,
        key: inPayload.configKey,
        value: inPayload.configValue,
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
        ...inPayload,
    });
}

export async function handleConfigRemove(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', new LogErrorNode('directoryValidationErrors'));
    const traceInject = registry.createNode("core-trace-fs:inject", {
        executor: 'cli',
        command: 'config',
        operation: 'remove',
        target: inPayload.target,
        key: inPayload.configKey,
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
        ...inPayload,
    });
}
