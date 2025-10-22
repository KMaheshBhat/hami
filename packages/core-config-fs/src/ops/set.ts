import assert from 'assert';
import { join } from "path";

import { HAMINode } from "@hami-frameworx/core";

import { CoreConfigFSOpts, CoreConfigFSStorage } from "../types.js";
import { CONFIG_FILE_NAME, fetchConfig, USER_CONFIG_FILE_NAME, writeConfig } from "./common.js";

type CoreConfigFSSetNodeInput = {
    opts?: CoreConfigFSOpts;
    hamiDirectory?: string;
    userHamiDirectory?: string;
    target: 'global' | 'local';
    configKey?: string;
    configValue?: any;
    configDir?: string;
    configPath?: string;
}

type CoreConfigFSSetNodeOutput = any;

class CoreConfigFSSetNode extends HAMINode<CoreConfigFSStorage> {
    kind(): string {
        return "core-config-fs:set";
    }

    async prep(
        shared: CoreConfigFSStorage,
    ): Promise<CoreConfigFSSetNodeInput> {
        assert(shared.target, 'target is required');
        assert(shared.configKey, 'configKey is required');
        assert(shared.configValue !== undefined, 'configValue is required');
        if (shared.target === 'global') {
            assert(shared.userHamiDirectory, 'userHamiDirectory is required for global target');
        }
        if (shared.target === 'local') {
            assert(shared.hamiDirectory, 'hamiDirectory is required for local target');
        }
        let configDir: string;
        let configPath: string;
        switch (shared.target) {
            case 'global':
                configDir = shared.userHamiDirectory!;
                configPath = join(configDir, USER_CONFIG_FILE_NAME);
                break;
            case 'local':
                configDir = shared.hamiDirectory!;
                configPath = join(configDir, CONFIG_FILE_NAME);
                break;
            default:
                throw new Error(`Invalid target: ${shared.target}`);
        }
        return {
            opts: shared.opts,
            hamiDirectory: shared.hamiDirectory,
            userHamiDirectory: shared.userHamiDirectory,
            target: shared.target || 'local',
            configKey: shared.configKey,
            configValue: shared.configValue,
            configDir: configDir,
            configPath: configPath,
        };
    }

    async exec(
        params: CoreConfigFSSetNodeInput,
    ): Promise<CoreConfigFSSetNodeOutput> {
        const verbose = !!params?.opts?.verbose;
        let config: Record<string, any> = await fetchConfig(params.configPath!);
        let previousValue = config[params.configKey!];
        config[params.configKey!] = params.configValue;
        await writeConfig(
            params.configDir!,
            params.configPath!,
            config,
        );
        verbose && console.log(`Config key '${params.configKey}' set to '${params.configValue}' (was: '${previousValue}') in ${params.target} config at ${params.configPath}`);
        return previousValue;
    }

    async post(
        shared: CoreConfigFSStorage,
        _prepRes: CoreConfigFSSetNodeInput,
        execRes: CoreConfigFSSetNodeOutput,
    ): Promise<string | undefined> {
        if (execRes !== undefined) {
            shared.configValuePrevious = execRes;
        }
        return "default";
    }
}

export {
    CoreConfigFSSetNode
};

