import assert from 'assert';

import { HAMINode } from "@hami/core";

import { CoreTraceFSOpts, CoreTraceFSStorage } from "../types.js";
import { fetchTraceIndex } from "./common.js";

type CoreTraceFSGrepNodeInput = {
    opts?: CoreTraceFSOpts;
    hamiDirectory?: string;
    searchQuery?: string;
}

type CoreTraceFSGrepNodeOutput = Record<string, any>[];

class CoreTraceFSGrepNode extends HAMINode<CoreTraceFSStorage> {
    kind(): string {
        return "core-trace-fs:grep";
    }

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