import { HAMINode } from "@hami-frameworx/core";

import { CoreTraceFSOpts, CoreTraceFSStorage } from "../types.js";

/**
 * Input type for the inject operation.
 * Contains the options and trace data to inject.
 */
type CoreTraceFSInjectNodeInput = {
    opts?: CoreTraceFSOpts;
    traceData?: Record<string, any>;
}

/**
 * Output type for the inject operation.
 * The injected trace data object.
 */
type CoreTraceFSInjectNodeOutput = Record<string, any>;

/**
 * CoreTraceFSInjectNode is a core trace file system operation node that injects trace data into the workflow.
 * It extends HAMINode and is used for providing initial or static trace data in HAMI workflows.
 * The node can be configured with trace data at construction time and injects it into the shared state.
 *
 * Configuration:
 * - `traceData`: The trace data object to inject (can be set via constructor, defaults to empty object).
 *
 * Expected shared state inputs:
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.traceData`: The injected trace data object for use by subsequent nodes.
 */
class CoreTraceFSInjectNode extends HAMINode<CoreTraceFSStorage> {
    private traceData: Record<string, any>;

    /**
     * Constructs a new CoreTraceFSInjectNode with the specified trace data.
     * @param traceData The trace data object to inject (defaults to empty object).
     * @param maxRetries Optional maximum number of retries for the node.
     * @param wait Optional wait time between retries.
     */
    constructor(
        traceData: Record<string, any> = {},
        maxRetries?: number,
        wait?: number,
    ) {
        super(maxRetries, wait);
        this.traceData = traceData;
    }

    /**
     * Returns the kind identifier for this node, which is 'core-trace-fs:inject'.
     * @returns The string 'core-trace-fs:inject'.
     */
    kind(): string {
        return "core-trace-fs:inject";
    }

    /**
     * Prepares the input parameters for the inject operation.
     * Uses the trace data configured at construction time.
     * @param shared The shared data object containing options.
     * @returns A promise that resolves to the prepared input parameters.
     */
    async prep(
        shared: CoreTraceFSStorage,
    ): Promise<CoreTraceFSInjectNodeInput> {
        return {
            opts: shared.opts,
            traceData: this.traceData,
        };
    }

    /**
     * Executes the inject operation by returning the configured trace data.
     * @param params The prepared input parameters containing the trace data.
     * @returns A promise that resolves to the trace data object.
     */
    async exec(
        params: CoreTraceFSInjectNodeInput,
    ): Promise<CoreTraceFSInjectNodeOutput> {
        return params.traceData!;
    }

    /**
     * Handles post-execution logic by storing the injected trace data in the shared state.
     * Sets the traceData property for use by subsequent nodes.
     * @param shared The shared data object to update with the trace data.
     * @param _prepRes The prepared input parameters (unused in this implementation).
     * @param execRes The execution result containing the trace data.
     * @returns A promise that resolves to 'default' to continue normal flow.
     */
    async post(
        shared: CoreTraceFSStorage,
        _prepRes: CoreTraceFSInjectNodeInput,
        execRes: CoreTraceFSInjectNodeOutput,
    ): Promise<string | undefined> {
        shared.traceData = execRes;
        return "default";
    }
}

export {
    CoreTraceFSInjectNode
};