import { HAMINode } from "@hami/core";

import { CoreTraceFSOpts, CoreTraceFSStorage } from "../types.js";

type CoreTraceFSInjectNodeInput = {
    opts?: CoreTraceFSOpts;
    traceData?: Record<string, any>;
}

type CoreTraceFSInjectNodeOutput = Record<string, any>;

class CoreTraceFSInjectNode extends HAMINode<CoreTraceFSStorage> {
    private traceData: Record<string, any>;

    constructor(
        traceData: Record<string, any> = {},
        maxRetries?: number,
        wait?: number,
    ) {
        super(maxRetries, wait);
        this.traceData = traceData;
    }

    kind(): string {
        return "core-trace-fs:inject";
    }

    async prep(
        shared: CoreTraceFSStorage,
    ): Promise<CoreTraceFSInjectNodeInput> {
        return {
            opts: shared.opts,
            traceData: this.traceData,
        };
    }

    async exec(
        params: CoreTraceFSInjectNodeInput,
    ): Promise<CoreTraceFSInjectNodeOutput> {
        return params.traceData!;
    }

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