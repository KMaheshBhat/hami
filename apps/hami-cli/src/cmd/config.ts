import { Flow } from "pocketflow";

import { CoreConfigFSGetAllNode, CoreConfigFSGetNode, CoreConfigFSRemoveNode, CoreConfigFSSetNode } from "@hami/core-config-fs";
import { ValidateNode } from "@hami/core-fs";
import { CoreTraceFSInjectNode, CoreTraceFSLogNode } from "@hami/core-trace-fs";

import { startContext, ValidateErrorHandlerNode } from "./common.js";

export async function handleGetAll(
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validateWorkingDirectory = new ValidateNode();
    const validateErrorHandler = new ValidateErrorHandlerNode();
    const coreConfigFSGetAll = new CoreConfigFSGetAllNode();
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

export async function handleGet(
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validateWorkingDirectory = new ValidateNode();
    const validateErrorHandler = new ValidateErrorHandlerNode();
    const coreConfigFSGet = new CoreConfigFSGetNode();
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

export async function handleSet(
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validateWorkingDirectory = new ValidateNode();
    const validateErrorHandler = new ValidateErrorHandlerNode();
    const traceDataInject = new CoreTraceFSInjectNode({
        executor: 'cli',
        command: 'config',
        operation: 'set',
        target: inPayload.target,
        key: inPayload.configKey,
        value: inPayload.configValue,
    });
    const coreConfigFSSet = new CoreConfigFSSetNode();
    const coreTraceFSLog = new CoreTraceFSLogNode();
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

export async function handleRemove(
    opts: Record<string, any>,
    inPayload: Record<string, any>,
) {
    const validateWorkingDirectory = new ValidateNode();
    const validateErrorHandler = new ValidateErrorHandlerNode();
    const traceDataInject = new CoreTraceFSInjectNode({
        executor: 'cli',
        command: 'config',
        operation: 'remove',
        target: inPayload.target,
        key: inPayload.configKey,
    });
    const coreConfigFSRemove = new CoreConfigFSRemoveNode();
    const coreTraceFSLog = new CoreTraceFSLogNode();
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
