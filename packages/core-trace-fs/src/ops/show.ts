import assert from 'assert';

import { HAMINode } from "@hami-frameworx/core";

import { CoreTraceFSOpts, CoreTraceFSStorage } from "../types.js";
import { fetchTraceIndex } from "./common.js";

/**
 * Input type for the show operation.
 * Contains the options, hami directory path, and trace ID to retrieve.
 */
type CoreTraceFSShowNodeInput = {
    opts?: CoreTraceFSOpts;
    hamiDirectory?: string;
    traceId?: string;
}

/**
 * Output type for the show operation.
 * The complete trace object with id, timestamp, and data.
 */
type CoreTraceFSShowNodeOutput = Record<string, any>;

/**
 * CoreTraceFSShowNode is a core trace file system operation node that retrieves a specific trace by ID.
 * It extends HAMINode and is used for fetching individual trace entries in HAMI workflows.
 * Searches the trace index for a trace with the specified ID and returns the complete trace data.
 *
 * Expected shared state inputs:
 * - `shared.hamiDirectory`: The path to the .hami directory where trace data is stored (required).
 * - `shared.traceId`: The unique identifier of the trace to retrieve (required).
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.traceData`: The complete trace object containing id, timestamp, and data.
 */
class CoreTraceFSShowNode extends HAMINode<CoreTraceFSStorage> {
    /**
     * Returns the kind identifier for this node, which is 'core-trace-fs:show'.
     * @returns The string 'core-trace-fs:show'.
     */
    kind(): string {
        return "core-trace-fs:show";
    }

    /**
     * Prepares the input parameters for the show operation.
     * Retrieves hamiDirectory and traceId from shared state, asserting they are present.
     * @param shared The shared data object containing hamiDirectory, traceId, and options.
     * @returns A promise that resolves to the prepared input parameters.
     */
    async prep(
        shared: CoreTraceFSStorage,
    ): Promise<CoreTraceFSShowNodeInput> {
        assert(shared.hamiDirectory, 'hamiDirectory is required');
        assert(shared.traceId, 'traceId is required');
        return {
            opts: shared.opts,
            hamiDirectory: shared.hamiDirectory,
            traceId: shared.traceId,
        };
    }

    /**
     * Executes the show operation by fetching the trace index and finding
     * the trace with the specified ID. Throws an error if the trace is not found.
     * Logs verbose output if enabled.
     * @param params The prepared input parameters containing hamiDirectory and traceId.
     * @returns A promise that resolves to the complete trace object.
     * @throws Error if the specified trace ID is not found.
     */
    async exec(
        params: CoreTraceFSShowNodeInput,
    ): Promise<CoreTraceFSShowNodeOutput> {
        const verbose = !!params?.opts?.verbose;
        const index = await fetchTraceIndex(params.hamiDirectory!);
        const trace = index.find(t => t.id === params.traceId);
        if (!trace) {
            throw new Error(`Trace ${params.traceId} not found`);
        }
        verbose && console.log(`Fetched trace ${params.traceId} from ${params.hamiDirectory}`);
        return trace;
    }

    /**
     * Handles post-execution logic by storing the retrieved trace data in the shared state.
     * Sets the traceData property for use by subsequent nodes.
     * @param shared The shared data object to update with the trace data.
     * @param _prepRes The prepared input parameters (unused in this implementation).
     * @param execRes The execution result containing the complete trace object.
     * @returns A promise that resolves to 'default' to continue normal flow.
     */
    async post(
        shared: CoreTraceFSStorage,
        _prepRes: CoreTraceFSShowNodeInput,
        execRes: CoreTraceFSShowNodeOutput,
    ): Promise<string | undefined> {
        shared.traceData = execRes;
        return "default";
    }
}

export {
    CoreTraceFSShowNode
};