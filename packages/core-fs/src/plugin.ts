import { createPlugin } from "@hami/core";
import { CoreFSCopyNode, CoreFSReadFileNode, InitWorkingDirectoryNode, ValidateNode } from "./ops/index.js";

const CoreFSPlugin = createPlugin(
    "core-fs",
    "0.1.0",
    [
        InitWorkingDirectoryNode as any,
        ValidateNode as any,
        CoreFSCopyNode as any,
        CoreFSReadFileNode as any,
    ],
    "HAMI Core File System Plugin",
);

export { CoreFSPlugin };
