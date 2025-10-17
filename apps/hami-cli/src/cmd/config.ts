import { Flow } from "pocketflow";

import { HAMIRegistrationManager } from "@hami/core";

import { startContext } from "./common.js";

export async function handleConfigList(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    console.log('handleConfigList');
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', registry.createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
    const getAllConfig = registry.createNode("core-config-fs:get-all", {});
    const logConfig = registry.createNode("core:log-result", {
        resultKey: "configValues",
        format: "table",
        prefix: "Configuration entries:",
        emptyMessage: "No configuration entries found.",
        verbose: opts.verbose
    });
    validate
        .next(getAllConfig)
        .next(logConfig);
    const flow = new Flow(validate);
    await flow.run({
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        ...inPayload,
    });
}

export async function handleConfigGet(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', registry.createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
    const getConfig = registry.createNode("core-config-fs:get", {});
    const logConfig = registry.createNode("core:log-result", {
        resultKey: "configValue",
        format: "generic",
        prefix: "Configuration value:",
        emptyMessage: "Configuration key not found.",
        verbose: opts.verbose
    });
    validate
        .next(getConfig)
        .next(logConfig);
    const flow = new Flow(validate);
    await flow.run({
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        ...inPayload,
    });
}

export async function handleConfigSet(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', registry.createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
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
        .on('error', registry.createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
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
