import { Flow } from "pocketflow";

import { HAMIRegistrationManager } from "@hami/core";

import { startContext, LogErrorNode } from "./common.js";

export async function handleConfigList(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validateWorkingDirectory = registry.createNode("core-fs:validate-hami", {});
    const validateErrorHandler = new LogErrorNode('directoryValidationErrors');
    const coreConfigFSGetAll = registry.createNode("core-config-fs:get-all", {});
    validateWorkingDirectory.on('error', validateErrorHandler);
    validateWorkingDirectory.next(coreConfigFSGetAll);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        ...inPayload,
    };
    const getAllFlow = new Flow(validateWorkingDirectory);
    await getAllFlow.run(shared);
    if (shared.configValues) {
        console.table(shared.configValues);
    }
}

export async function handleConfigGet(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validateWorkingDirectory = registry.createNode("core-fs:validate-hami", {});
    const validateErrorHandler = new LogErrorNode('directoryValidationErrors');
    const coreConfigFSGet = registry.createNode("core-config-fs:get", {});
    validateWorkingDirectory.on('error', validateErrorHandler);
    validateWorkingDirectory.next(coreConfigFSGet);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        ...inPayload,
    };
    const getFlow = new Flow(validateWorkingDirectory);
    await getFlow.run(shared);
    if (shared.configValue) {
        console.log(shared.configValue);
    }
}

export async function handleConfigSet(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validateWorkingDirectory = registry.createNode("core-fs:validate-hami", {});
    const validateErrorHandler = new LogErrorNode('directoryValidationErrors');
    const traceDataInject = registry.createNode("core-trace-fs:inject", {
        executor: 'cli',
        command: 'config',
        operation: 'set',
        target: inPayload.target,
        key: inPayload.configKey,
        value: inPayload.configValue,
    });
    const coreConfigFSSet = registry.createNode("core-config-fs:set", {});
    const coreTraceFSLog = registry.createNode("core-trace-fs:log", {});
    validateWorkingDirectory.on('error', validateErrorHandler);
    validateWorkingDirectory.next(traceDataInject).next(coreConfigFSSet).next(coreTraceFSLog);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        ...inPayload,
    };
    const setFlow = new Flow(validateWorkingDirectory);
    await setFlow.run(shared);
}

export async function handleConfigRemove(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validateWorkingDirectory = registry.createNode("core-fs:validate-hami", {});
    const validateErrorHandler = new LogErrorNode('directoryValidationErrors');
    const traceDataInject = registry.createNode("core-trace-fs:inject", {
        executor: 'cli',
        command: 'config',
        operation: 'remove',
        target: inPayload.target,
        key: inPayload.configKey,
    });
    const coreConfigFSRemove = registry.createNode("core-config-fs:remove", {});
    const coreTraceFSLog = registry.createNode("core-trace-fs:log", {});
    validateWorkingDirectory.on('error', validateErrorHandler);
    validateWorkingDirectory.next(traceDataInject).next(coreConfigFSRemove).next(coreTraceFSLog);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        ...inPayload,
    };
    const removeFlow = new Flow(validateWorkingDirectory);
    await removeFlow.run(shared);
}
