import { Flow } from "pocketflow";

import { HAMIRegistrationManager } from "@hami/core";

import { startContext, LogErrorNode } from "./common.js";

export async function handleTraceList(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
) {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', new LogErrorNode('directoryValidationErrors'));
    const listTraces = registry.createNode("core-trace-fs:list", {});
    validate
        .next(listTraces);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
    };
    const flow = new Flow(validate);
    await flow.run(shared);
    if (shared.traceResults) {
        console.table(shared.traceResults);
    }
}

export async function handleTraceShow(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    traceId: string,
) {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', new LogErrorNode('directoryValidationErrors'));
    const showTrace = registry.createNode("core-trace-fs:show", {});
    validate
        .next(showTrace);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        traceId: traceId,
        ...startContext(),
    };
    const flow = new Flow(validate);
    await flow.run(shared);
    if (shared.traceData) {
        console.log(JSON.stringify(shared.traceData, null, 2));
    }
}

export async function handleTraceGrep(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    searchQuery: string,
) {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', new LogErrorNode('directoryValidationErrors'));
    const grepTraces = registry.createNode("core-trace-fs:grep", {});
    validate
        .next(grepTraces);
    const shared: Record<string, any> = {
        coreFSStrategy: 'CWD',
        opts: opts,
        searchQuery: searchQuery,
        ...startContext(),
    };
    const flow = new Flow(validate);
    await flow.run(shared);
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
