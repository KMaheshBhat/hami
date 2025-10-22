import assert from 'assert';

import { HAMINode } from "@hami-frameworx/core";

import { CoreTraceFSOpts, CoreTraceFSStorage } from "../types.js";
import { fetchTraceIndex } from "./common.js";

/**
 * Input type for the grep operation.
 * Contains the options, hami directory path, and search query for filtering traces.
 */
type CoreTraceFSGrepNodeInput = {
    opts?: CoreTraceFSOpts;
    hamiDirectory?: string;
    searchQuery?: string;
}

/**
 * Output type for the grep operation.
 * An array of trace objects that match the search query.
 */
type CoreTraceFSGrepNodeOutput = Record<string, any>[];

/**
 * CoreTraceFSGrepNode is a core trace file system operation node that searches trace entries using a text query.
 * It extends HAMINode and is used for finding specific traces in HAMI workflows.
 * Performs a simple string search across the JSON representation of all trace data and returns matching traces.
 *
 * Expected shared state inputs:
 * - `shared.hamiDirectory`: The path to the .hami directory where trace data is stored (required).
 * - `shared.searchQuery`: The text string to search for within trace data (required).
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.traceResults`: An array of complete trace objects that match the search query.
 */
class CoreTraceFSGrepNode extends HAMINode<CoreTraceFSStorage> {
    /**
     * Returns the kind identifier for this node, which is 'core-trace-fs:grep'.
     * @returns The string 'core-trace-fs:grep'.
     */
    kind(): string {
        return "core-trace-fs:grep";
    }

    /**
     * Prepares the input parameters for the grep operation.
     * Retrieves hamiDirectory and searchQuery from shared state, asserting they are present.
     * @param shared The shared data object containing hamiDirectory, searchQuery, and options.
     * @returns A promise that resolves to the prepared input parameters.
     */
    async prep(
        shared: CoreTraceFSStorage,
    ): Promise<CoreTraceFSGrepNodeInput> {
        assert(shared.hamiDirectory, 'hamiDirectory is required');
        assert(shared.searchQuery, 'searchQuery is required');
        return {
            opts: shared.opts,
            hamiDirectory: shared.hamiDirectory,
            searchQuery: shared.searchQuery,
        };
    }

    /**
     * Executes the grep operation by fetching the trace index and searching
     * through each trace's JSON representation for the specified query string.
     * Collects and returns all matching traces. Logs verbose output if enabled.
     * @param params The prepared input parameters containing hamiDirectory and searchQuery.
     * @returns A promise that resolves to an array of matching trace objects.
     */
    async exec(
        params: CoreTraceFSGrepNodeInput,
    ): Promise<CoreTraceFSGrepNodeOutput> {
        const verbose = !!params?.opts?.verbose;
        const index = await fetchTraceIndex(params.hamiDirectory!);
        const results: Record<string, any>[] = [];

        for (const trace of index) {
            const traceString = JSON.stringify(trace);
            if (traceString.includes(params.searchQuery!)) {
                results.push(trace);
            }
        }

        verbose && console.log(`Found ${results.length} traces matching '${params.searchQuery}' in ${params.hamiDirectory}`);
        return results;
    }

    /**
     * Handles post-execution logic by storing the grep results in the shared state.
     * Sets the traceResults property for use by subsequent nodes.
     * @param shared The shared data object to update with the grep results.
     * @param _prepRes The prepared input parameters (unused in this implementation).
     * @param execRes The execution result containing the array of matching traces.
     * @returns A promise that resolves to 'default' to continue normal flow.
     */
    async post(
        shared: CoreTraceFSStorage,
        _prepRes: CoreTraceFSGrepNodeInput,
        execRes: CoreTraceFSGrepNodeOutput,
    ): Promise<string | undefined> {
        shared.traceResults = execRes;
        return "default";
    }
}

export {
    CoreTraceFSGrepNode
};