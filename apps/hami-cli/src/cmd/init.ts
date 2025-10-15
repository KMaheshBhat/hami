import { Flow } from "pocketflow";

import { CoreFSOpts, InitWorkingDirectoryNode } from "@hami/core-fs";
import { CoreTraceFSInjectNode, CoreTraceFSLogNode } from "@hami/core-trace-fs";

export async function handleInit(
    opts: Record<string, any>,
) {
    const initWorkingDirectory = new InitWorkingDirectoryNode();
    const traceDataInject = new CoreTraceFSInjectNode({
        executor: 'cli',
        command: 'init',
    });
    const coreTraceFSLog = new CoreTraceFSLogNode();
    initWorkingDirectory
        .next(traceDataInject)
        .next(coreTraceFSLog);
    const initFlow = new Flow(initWorkingDirectory);
    await initFlow.run({
        coreFSStrategy: 'CWD',
        opts: opts as CoreFSOpts,
    });
}
