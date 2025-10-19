import { createPlugin } from "./registration.js";
import { LogResultNode, LogErrorNode, DynamicRunnerNode, DynamicRunnerFlow, MapNode, DebugNode } from "./ops/index.js";

const CorePlugin = createPlugin(
    "@hami/core",
    "1.0.0",
    [
        LogResultNode as any,
        LogErrorNode as any,
        DynamicRunnerNode as any,
        DynamicRunnerFlow as any,
        MapNode as any,
        DebugNode as any,
    ],
    "HAMI Core Plugin - Fundamental nodes for logging and dynamic execution",
);

export { CorePlugin };