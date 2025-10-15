import { Flow, Node } from "pocketflow";

import { CoreConfigFSGetAllNode, CoreConfigFSGetNode, CoreConfigFSSetNode, CoreConfigFSRemoveNode } from "@hami/core-config-fs";
import { ValidateNode } from "@hami/core-fs";

import { startContext } from "./common.js";

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
    const coreConfigFSSet = new CoreConfigFSSetNode();
    validateWorkingDirectory.on('error', validateErrorHandler);
    validateWorkingDirectory.next(coreConfigFSSet);
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
    const coreConfigFSRemove = new CoreConfigFSRemoveNode();
    validateWorkingDirectory.on('error', validateErrorHandler);
    validateWorkingDirectory.next(coreConfigFSRemove);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
        ...inPayload,
    };
    const removeFlow = new Flow(validateWorkingDirectory);
    await removeFlow.run(shared);
}

class ValidateErrorHandlerNode extends Node {
    async prep(shared: Record<string, any>): Promise<void> {
        console.log('Validation failed.');
        console.log('errors:', shared.directoryValidationErrors);
        return;
    }
}