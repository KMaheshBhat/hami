import { Flow } from "pocketflow";

import { ValidateNode } from "@hami/core-fs";
import { CoreTraceFSGrepNode, CoreTraceFSListNode, CoreTraceFSShowNode } from "@hami/core-trace-fs";

import { startContext, ValidateErrorHandlerNode } from "./common.js";

export async function handleTraceList(
    opts: Record<string, any>,
) {
    const validateWorkingDirectory = new ValidateNode();
    const validateErrorHandler = new ValidateErrorHandlerNode();
    const coreTraceFSList = new CoreTraceFSListNode();
    validateWorkingDirectory.on('error', validateErrorHandler);
    validateWorkingDirectory.next(coreTraceFSList);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
    };
    const listFlow = new Flow(validateWorkingDirectory);
    await listFlow.run(shared);
    if (shared.traceResults) {
        console.table(shared.traceResults);
    }
}

export async function handleTraceShow(
    opts: Record<string, any>,
    traceId: string,
) {
    const validateWorkingDirectory = new ValidateNode();
    const validateErrorHandler = new ValidateErrorHandlerNode();
    const coreTraceFSShow = new CoreTraceFSShowNode();
    validateWorkingDirectory.on('error', validateErrorHandler);
    validateWorkingDirectory.next(coreTraceFSShow);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        traceId: traceId,
        ...startContext(),
    };
    const showFlow = new Flow(validateWorkingDirectory);
    await showFlow.run(shared);
    if (shared.traceData) {
        console.log(JSON.stringify(shared.traceData, null, 2));
    }
}

export async function handleTraceGrep(
    opts: Record<string, any>,
    searchQuery: string,
) {
    const validateWorkingDirectory = new ValidateNode();
    const validateErrorHandler = new ValidateErrorHandlerNode();
    const coreTraceFSGrep = new CoreTraceFSGrepNode();
    validateWorkingDirectory.on('error', validateErrorHandler);
    validateWorkingDirectory.next(coreTraceFSGrep);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        searchQuery: searchQuery,
        ...startContext(),
    };
    const grepFlow = new Flow(validateWorkingDirectory);
    await grepFlow.run(shared);
    if (shared.traceResults && shared.traceResults.length > 0) {
        const tableData = shared.traceResults.map((trace: any) => ({
            id: trace.id,
            timestamp: trace.timestamp,
            data: JSON.stringify(trace.data),
        }));
        console.table(tableData);
    } else {
        console.log('No traces found matching the search query.');
    }
}
