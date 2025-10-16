import { Flow } from "pocketflow";

import { HAMIRegistrationManager } from "@hami/core";
import { CoreFSOpts } from "@hami/core-fs";
import { CoreTraceFSInjectNode, CoreTraceFSLogNode } from "@hami/core-trace-fs";

export async function handleInit(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
) {
    const initWorkingDirectory = registry.createNode("core-fs:init-hami", {
        strategy: 'CWD',
    });
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
        opts: opts as CoreFSOpts,
    });
}
