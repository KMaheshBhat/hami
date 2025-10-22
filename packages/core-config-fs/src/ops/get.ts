import assert from 'assert';
import { join } from "path";

import { HAMINode } from "@hami-frameworx/core";

import { CoreConfigFSOpts, CoreConfigFSStorage } from "../types.js";
import { CONFIG_FILE_NAME, fetchConfig, USER_CONFIG_FILE_NAME } from "./common.js";

type CoreConfigFSGetNodeInput = {
    opts?: CoreConfigFSOpts;
    hamiDirectory?: string;
    userHamiDirectory?: string;
    target: 'global' | 'local' | 'local-and-global';
    configKey?: string;
    configDir?: string;
    configPath?: string;
}

type CoreConfigFSGetNodeOutput = any;

class CoreConfigFSGetNode extends HAMINode<CoreConfigFSStorage> {
    kind(): string {
        return "core-config-fs:get";
    }

    async prep(
        shared: CoreConfigFSStorage,
    ): Promise<CoreConfigFSGetNodeInput> {
        const target = shared.target || 'local';
        const useGlobalFallback = shared.useGlobalFallback || true;
        assert(shared.configKey, 'configKey is required');
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
            configKey: shared.configKey,
            configDir,
            configPath,
        };
    }

    async exec(
        params: CoreConfigFSGetNodeInput,
    ): Promise<CoreConfigFSGetNodeOutput> {
        const verbose = !!params?.opts?.verbose;
        let value;
        if (params.target === 'local' || params.target === 'global') {
            const config = await fetchConfig(params.configPath!);
            value = config[params.configKey!];
        } else if (params.target === 'local-and-global') {
            // Try local first
            let config = await fetchConfig(join(params.hamiDirectory!, CONFIG_FILE_NAME));
            if (config[params.configKey!] !== undefined) {
                value = config[params.configKey!];
            } else {
                // Fallback to global
                config = await fetchConfig(join(params.userHamiDirectory!, USER_CONFIG_FILE_NAME));
                value = config[params.configKey!];
            }
        } else {
            throw new Error(`Invalid target: ${params.target}`);
        }
        verbose && console.log(`Fetched config value for key '${params.configKey}' from ${params.configPath}:`, value);
        return value;
    }

    async post(
        shared: CoreConfigFSStorage,
        _prepRes: CoreConfigFSGetNodeInput,
        execRes: CoreConfigFSGetNodeOutput,
    ): Promise<string | undefined> {
        shared.configValue = execRes;
        return "default";
    }
}

export {
    CoreConfigFSGetNode
};
