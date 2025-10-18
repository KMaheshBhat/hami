import { createPlugin } from "@hami/core";
import { CoreTraceFSInjectNode, CoreTraceFSLogNode, CoreTraceFSListNode, CoreTraceFSShowNode, CoreTraceFSGrepNode } from "./ops/index.js";

const CoreTraceFSPlugin = createPlugin(
    "core-trace-fs",
    "0.1.0",
    [
        CoreTraceFSInjectNode as any,
        CoreTraceFSLogNode as any,
        CoreTraceFSListNode as any,
        CoreTraceFSShowNode as any,
        CoreTraceFSGrepNode as any,
    ],
    "HAMI Core Trace File System Plugin",
);

export { CoreTraceFSPlugin };