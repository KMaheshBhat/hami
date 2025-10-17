import { Flow } from "pocketflow";

import { HAMIRegistrationManager } from "@hami/core";
import { CoreFSOpts } from "@hami/core-fs";
import { CoreTraceFSInjectNode, CoreTraceFSLogNode } from "@hami/core-trace-fs";

export async function handleInit(
    registry: HAMIRegistrationManager,
    opts: Record<string, any>,
) {
    const init = registry.createNode("core-fs:init-hami", {
        strategy: 'CWD',
    });
    const traceInject = new CoreTraceFSInjectNode({
        executor: 'cli',
        command: 'init',
    });
    const traceLog = new CoreTraceFSLogNode();
    init
        .next(traceInject)
        .next(traceLog);
    const flow = new Flow(init);
    await flow.run({
        opts: opts as CoreFSOpts,
    });
}
