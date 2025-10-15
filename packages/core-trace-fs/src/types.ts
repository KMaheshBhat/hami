type CoreTraceFSOpts = {
    verbose?: boolean;
}

type CoreTraceFSStorage = {
    opts?: CoreTraceFSOpts;
    hamiDirectory?: string;
    traceIndex?: Record<string, any>[];
    traceId?: string;
    traceData?: Record<string, any>;
    traceResults?: Record<string, any>[];
    searchQuery?: string;
}

export {
    CoreTraceFSOpts,
    CoreTraceFSStorage,
}