import { Flow, Node } from "pocketflow";

import { HAMIRegistrationManager } from "@hami/core";

import { startContext } from "./common.js";

export async function handleTraceList(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
) {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', registry.createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
    const listTraces = registry.createNode("core-trace-fs:list", {});
    const logTraces = registry.createNode("core:log-result", {
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
        .on('error', registry.createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
    const showTrace = registry.createNode("core-trace-fs:show", {});
    const logTrace = registry.createNode("core:log-result", {
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

export class TransformTraceResultsNode extends Node {
    async prep(shared: Record<string, any>): Promise<any | undefined> {
        return shared.traceResults;
    }

    async exec(prepRes: any | undefined): Promise<Record<string, any>[]> {
        if (prepRes && prepRes.length > 0) {
            const tableData = prepRes.map((trace: any) => ({
                id: trace.id,
                timestamp: trace.timestamp,
                data: JSON.stringify(trace.data),
            }));
            return tableData;
        } else {
            return [];
        }
    }

    async post(shared: Record<string, any>, prepRes: any | undefined, execRes: Record<string, any>[]): Promise<string | undefined> {
        shared.transformedTraceResults = execRes;
        return 'default';
    }
}

export async function handleTraceGrep(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
    searchQuery: string,
) {
    const validate = registry.createNode("core-fs:validate-hami", {});
    validate
        .on('error', registry.createNode('core:log-error', { errorKey: 'directoryValidationErrors' }));
    const grepTraces = registry.createNode("core-trace-fs:grep", {});
    const transformResults = new TransformTraceResultsNode();
    const logResults = registry.createNode("core:log-result", {
        resultKey: "transformedTraceResults",
        format: "table",
        prefix: "Trace search results:",
        emptyMessage: "No traces found matching the search query.",
        verbose: opts.verbose
    });
    validate
        .next(grepTraces)
        .next(transformResults as any)
        .next(logResults);
    const flow = new Flow(validate);
    await flow.run({
        coreFSStrategy: 'CWD',
        opts: opts,
        searchQuery: searchQuery,
        ...startContext(),
    });
}
