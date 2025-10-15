type CoreConfigFSOpts = {
    verbose?: boolean;
}

type CoreConfigFSStorage = {
    opts?: CoreConfigFSOpts;
    hamiDirectory?: string;
    userHamiDirectory?: string;
    target: 'global' | 'local' | null;
    useGlobalFallback?: boolean;
    configKey?: string;
    configValue?: any;
    configValues?: Record<string, any>;
    configValuePrevious?: any;
}

export {
    CoreConfigFSOpts,
    CoreConfigFSStorage,
}