import { createPlugin, HAMIFlow } from "@hami/core";
import { CoreFSCopyNode, InitWorkingDirectoryNode, ValidateNode } from "./operations/index.js";

const CoreFSPlugin = createPlugin(
    "core-fs",
    "0.1.0",
    [
        InitWorkingDirectoryNode as any,
        ValidateNode as any,
        CoreFSCopyNode as any,
    ],
    "HAMI Core File System Plugin",
);

export { CoreFSPlugin };