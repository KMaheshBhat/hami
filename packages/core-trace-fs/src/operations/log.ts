import assert from 'assert';
import { uuidv7 } from 'uuidv7';

import { HAMINode } from "@hami/core";

import { CoreTraceFSOpts, CoreTraceFSStorage } from "../types.js";
import { fetchTraceIndex, writeTraceIndex } from "./common.js";

type CoreTraceFSLogNodeInput = {
    opts?: CoreTraceFSOpts;
    hamiDirectory?: string;
    traceData?: Record<string, any>;
}

type CoreTraceFSLogNodeOutput = string;

class CoreTraceFSLogNode extends HAMINode<CoreTraceFSStorage> {
    kind(): string {
        return "core-trace-fs:log";
    }

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