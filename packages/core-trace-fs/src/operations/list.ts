import assert from 'assert';

import { HAMINode } from "@hami/core";

import { CoreTraceFSOpts, CoreTraceFSStorage } from "../types.js";
import { fetchTraceIndex } from "./common.js";

type CoreTraceFSListNodeInput = {
    opts?: CoreTraceFSOpts;
    hamiDirectory?: string;
}

type CoreTraceFSListNodeOutput = any[];

class CoreTraceFSListNode extends HAMINode<CoreTraceFSStorage> {
    kind(): string {
        return "core-trace-fs:list";
    }

    async prep(
        shared: CoreTraceFSStorage,
    ): Promise<CoreTraceFSListNodeInput> {
        assert(shared.hamiDirectory, 'hamiDirectory is required');
        return {
            opts: shared.opts,
            hamiDirectory: shared.hamiDirectory,
        };
    }

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