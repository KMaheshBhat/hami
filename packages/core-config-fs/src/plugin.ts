import { createPlugin } from "@hami-frameworx/core";
import { CoreConfigFSGetNode, CoreConfigFSGetAllNode, CoreConfigFSSetNode, CoreConfigFSRemoveNode } from "./ops/index.js";

const CoreConfigFSPlugin = createPlugin(
    "core-config-fs",
    "0.1.0",
    [
        CoreConfigFSGetNode as any,
        CoreConfigFSGetAllNode as any,
        CoreConfigFSSetNode as any,
        CoreConfigFSRemoveNode as any,
    ],
    "HAMI Core Configuration File System Plugin",
);

export { CoreConfigFSPlugin };