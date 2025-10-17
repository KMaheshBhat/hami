import { Flow } from "pocketflow";

import { HAMIRegistrationManager } from "@hami/core";

import { startContext, LogErrorNode, EnhancedLogResult } from "./common.js";

export async function handleTraceList(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
) {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', new LogErrorNode('directoryValidationErrors'));
    const listTraces = registry.createNode("core-trace-fs:list", {});
    const logTraces = new EnhancedLogResult({
        resultKey: "traceResults",
        format: "table",
        prefix: "Trace entries:",
        emptyMessage: "No trace entries found.",
        verbose: opts.verbose
    });
    validate
        .next(listTraces)
        .next(logTraces);
    const flow = new Flow(validate);
    await flow.run({
        coreFSStrategy: 'CWD',
        opts: opts,
        ...startContext(),
    });
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
    const logTrace = new EnhancedLogResult({
        resultKey: "traceData",
        format: "json",
        prefix: "Trace data:",
        includeTimestamp: true,
        verbose: opts.verbose
    });
    validate
        .next(showTrace)
        .next(logTrace);
    const flow = new Flow(validate);
    await flow.run({
        coreFSStrategy: 'CWD',
        opts: opts,
        traceId: traceId,
        ...startContext(),
    });
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
