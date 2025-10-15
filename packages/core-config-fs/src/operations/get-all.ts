import assert from 'assert';
import { join } from "path";

import { HAMINode } from "@hami/core";

import { CoreConfigFSOpts, CoreConfigFSStorage } from "../types.js";
import { CONFIG_FILE_NAME, fetchConfig, USER_CONFIG_FILE_NAME } from "./common.js";

type CoreConfigFSGetAllNodeInput = {
    opts?: CoreConfigFSOpts;
    hamiDirectory?: string;
    userHamiDirectory?: string;
    target: 'global' | 'local' | 'local-and-global';
    configDir?: string;
    configPath?: string;
}

type CoreConfigFSGetAllNodeOutput = Record<string, any>;

class CoreConfigFSGetAllNode extends HAMINode<CoreConfigFSStorage> {
    kind(): string {
        return "core-config-fs:get-all";
    }

    async prep(
        shared: CoreConfigFSStorage,
    ): Promise<CoreConfigFSGetAllNodeInput> {
        const target = shared.target || 'local';
        const useGlobalFallback = shared.useGlobalFallback || true;
        let strategy: 'global' | 'local' | 'local-and-global';
        if (target === 'global') {
            strategy = 'global';
        } else if (target === 'local' && useGlobalFallback) {
            strategy = 'local-and-global';
        } else {
            strategy = 'local';
        }
        let configDir: string | undefined = undefined;
        let configPath: string | undefined = undefined;
        switch (strategy) {
            case 'global':
                assert(shared.userHamiDirectory, 'userHamiDirectory is required for global target');
                configDir = shared.userHamiDirectory!;
                configPath = join(configDir, USER_CONFIG_FILE_NAME);
                break;
            case 'local':
                assert(shared.hamiDirectory, 'hamiDirectory is required for local target');
                configDir = shared.hamiDirectory!;
                configPath = join(configDir, CONFIG_FILE_NAME);
                break;
            case 'local-and-global':
                assert(shared.hamiDirectory && shared.userHamiDirectory, 'Both hamiDirectory and userHamiDirectory are required for local-and-global target');
                break;
            default:
                throw new Error(`Invalid strategy: ${strategy}`);
        }
        return {
            opts: shared.opts,
            hamiDirectory: shared.hamiDirectory,
            userHamiDirectory: shared.userHamiDirectory,
            target: strategy,
            configDir,
            configPath,
        };
    }

    async exec(
        params: CoreConfigFSGetAllNodeInput,
    ): Promise<CoreConfigFSGetAllNodeOutput> {
        const verbose = !!params?.opts?.verbose;
        let config: Record<string, any>;
        if (params.target === 'local' || params.target === 'global') {
            config = await fetchConfig(params.configPath!);
        } else if (params.target === 'local-and-global') {
            // Load global config first
            config = await fetchConfig(join(params.userHamiDirectory!, USER_CONFIG_FILE_NAME));
            // Merge local config, overwriting global values
            const localConfig = await fetchConfig(join(params.hamiDirectory!, CONFIG_FILE_NAME));
            config = { ...config, ...localConfig };
        } else {
            throw new Error(`Invalid target: ${params.target}`);
        }
        verbose && console.log(`Fetched all config from ${params.target}:`, config);
        return config;
    }

    async post(
        shared: CoreConfigFSStorage,
        _prepRes: CoreConfigFSGetAllNodeInput,
        execRes: CoreConfigFSGetAllNodeOutput,
    ): Promise<string | undefined> {
        shared.configValues = execRes;
        return "default";
    }
}

export {
    CoreConfigFSGetAllNode
};