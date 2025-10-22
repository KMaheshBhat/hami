import assert from 'assert';
import { uuidv7 } from 'uuidv7';

import { HAMINode } from "@hami-frameworx/core";

import { CoreTraceFSOpts, CoreTraceFSStorage } from "../types.js";
import { fetchTraceIndex, writeTraceIndex } from "./common.js";

/**
 * Input type for the log operation.
 * Contains the options, hami directory path, and trace data to log.
 */
type CoreTraceFSLogNodeInput = {
    opts?: CoreTraceFSOpts;
    hamiDirectory?: string;
    traceData?: Record<string, any>;
}

/**
 * Output type for the log operation.
 * The generated trace ID string.
 */
type CoreTraceFSLogNodeOutput = string;

/**
 * CoreTraceFSLogNode is a core trace file system operation node that logs trace data to the file system.
 * It extends HAMINode and is used for logging trace information in HAMI workflows.
 * Generates a unique trace ID and timestamp, then stores the trace data in the trace index file.
 *
 * Expected shared state inputs:
 * - `shared.hamiDirectory`: The path to the .hami directory where trace data is stored (required).
 * - `shared.traceData`: The trace data object to log (required).
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.traceId`: The generated unique trace ID for the logged trace data.
 */
class CoreTraceFSLogNode extends HAMINode<CoreTraceFSStorage> {
    /**
     * Returns the kind identifier for this node, which is 'core-trace-fs:log'.
     * @returns The string 'core-trace-fs:log'.
     */
    kind(): string {
        return "core-trace-fs:log";
    }

    /**
     * Prepares the input parameters for the log operation.
     * Retrieves hamiDirectory and traceData from shared state, asserting they are present.
     * @param shared The shared data object containing hamiDirectory and traceData.
     * @returns A promise that resolves to the prepared input parameters.
     */
    async prep(
        shared: CoreTraceFSStorage,
    ): Promise<CoreTraceFSLogNodeInput> {
        assert(shared.hamiDirectory, 'hamiDirectory is required');
        assert(shared.traceData !== undefined, 'traceData is required');
        return {
            opts: shared.opts,
            hamiDirectory: shared.hamiDirectory,
            traceData: shared.traceData,
        };
    }

    /**
     * Executes the log operation by generating a unique trace ID and timestamp,
     * fetching the current trace index, appending the new trace data, and writing it back.
     * Logs verbose output if enabled.
     * @param params The prepared input parameters containing hamiDirectory and traceData.
     * @returns A promise that resolves to the generated trace ID.
     */
    async exec(
        params: CoreTraceFSLogNodeInput,
    ): Promise<CoreTraceFSLogNodeOutput> {
        const verbose = !!params?.opts?.verbose;
        const traceId = uuidv7();
        const timestamp = new Date().toISOString();

        // Update the index with the full trace data
        const index = await fetchTraceIndex(params.hamiDirectory!);
        index.push({
            id: traceId,
            timestamp,
            data: params.traceData,
        });
        await writeTraceIndex(params.hamiDirectory!, index);

        verbose && console.log(`Logged trace ${traceId} to ${params.hamiDirectory}`);
        return traceId;
    }

    /**
     * Handles post-execution logic by storing the generated trace ID in the shared state.
     * Sets the traceId property for use by subsequent nodes.
     * @param shared The shared data object to update with the trace ID.
     * @param _prepRes The prepared input parameters (unused in this implementation).
     * @param execRes The execution result containing the trace ID.
     * @returns A promise that resolves to 'default' to continue normal flow.
     */
    async post(
        shared: CoreTraceFSStorage,
        _prepRes: CoreTraceFSLogNodeInput,
        execRes: CoreTraceFSLogNodeOutput,
    ): Promise<string | undefined> {
        shared.traceId = execRes;
        return "default";
    }
}

export {
    CoreTraceFSLogNode
};