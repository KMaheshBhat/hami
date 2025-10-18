import assert from 'assert';

import { HAMINode } from "@hami/core";

import { CoreTraceFSOpts, CoreTraceFSStorage } from "../types.js";
import { fetchTraceIndex } from "./common.js";

type CoreTraceFSShowNodeInput = {
    opts?: CoreTraceFSOpts;
    hamiDirectory?: string;
    traceId?: string;
}

type CoreTraceFSShowNodeOutput = Record<string, any>;

class CoreTraceFSShowNode extends HAMINode<CoreTraceFSStorage> {
    kind(): string {
        return "core-trace-fs:show";
    }

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