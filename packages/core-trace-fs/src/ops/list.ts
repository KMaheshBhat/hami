import assert from 'assert';

import { HAMINode } from "@hami-frameworx/core";

import { CoreTraceFSOpts, CoreTraceFSStorage } from "../types.js";
import { fetchTraceIndex } from "./common.js";

/**
 * Input type for the list operation.
 * Contains the options and hami directory path for listing traces.
 */
type CoreTraceFSListNodeInput = {
    opts?: CoreTraceFSOpts;
    hamiDirectory?: string;
}

/**
 * Output type for the list operation.
 * An array of trace summary objects containing id and timestamp.
 */
type CoreTraceFSListNodeOutput = any[];

/**
 * CoreTraceFSListNode is a core trace file system operation node that lists trace entries from the file system.
 * It extends HAMINode and is used for retrieving a summary of all logged traces in HAMI workflows.
 * Fetches the trace index and returns a list of trace IDs and timestamps without the full trace data.
 *
 * Expected shared state inputs:
 * - `shared.hamiDirectory`: The path to the .hami directory where trace data is stored (required).
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.traceResults`: An array of trace summary objects with id and timestamp for each trace.
 */
class CoreTraceFSListNode extends HAMINode<CoreTraceFSStorage> {
    /**
     * Returns the kind identifier for this node, which is 'core-trace-fs:list'.
     * @returns The string 'core-trace-fs:list'.
     */
    kind(): string {
        return "core-trace-fs:list";
    }

    /**
     * Prepares the input parameters for the list operation.
     * Retrieves hamiDirectory from shared state, asserting it is present.
     * @param shared The shared data object containing hamiDirectory and options.
     * @returns A promise that resolves to the prepared input parameters.
     */
    async prep(
        shared: CoreTraceFSStorage,
    ): Promise<CoreTraceFSListNodeInput> {
        assert(shared.hamiDirectory, 'hamiDirectory is required');
        return {
            opts: shared.opts,
            hamiDirectory: shared.hamiDirectory,
        };
    }

    /**
     * Executes the list operation by fetching the trace index and extracting
     * summary information (id and timestamp) for each trace entry.
     * Logs verbose output if enabled.
     * @param params The prepared input parameters containing hamiDirectory.
     * @returns A promise that resolves to an array of trace summary objects.
     */
    async exec(
        params: CoreTraceFSListNodeInput,
    ): Promise<CoreTraceFSListNodeOutput> {
        const verbose = !!params?.opts?.verbose;
        const index = await fetchTraceIndex(params.hamiDirectory!);
        const traces = index.map(trace => ({
            id: trace.id,
            timestamp: trace.timestamp,
        }));
        verbose && console.log(`Listed ${traces.length} traces from ${params.hamiDirectory}`);
        return traces;
    }

    /**
     * Handles post-execution logic by storing the trace results in the shared state.
     * Sets the traceResults property for use by subsequent nodes.
     * @param shared The shared data object to update with the trace results.
     * @param _prepRes The prepared input parameters (unused in this implementation).
     * @param execRes The execution result containing the array of trace summaries.
     * @returns A promise that resolves to 'default' to continue normal flow.
     */
    async post(
        shared: CoreTraceFSStorage,
        _prepRes: CoreTraceFSListNodeInput,
        execRes: CoreTraceFSListNodeOutput,
    ): Promise<string | undefined> {
        shared.traceResults = execRes;
        return "default";
    }
}

export {
    CoreTraceFSListNode
};