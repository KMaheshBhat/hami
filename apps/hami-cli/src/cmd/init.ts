import { Flow } from "pocketflow";

import { CoreFSOpts, InitWorkingDirectoryNode } from "@hami/core-fs";

export async function handleInit(
    opts: Record<string, any>,
) {
    const initWorkingDirectory = new InitWorkingDirectoryNode();
    const initFlow = new Flow(initWorkingDirectory);
    await initFlow.run({
        coreFSStrategy: 'CWD',
        opts: opts as CoreFSOpts,
    });
}