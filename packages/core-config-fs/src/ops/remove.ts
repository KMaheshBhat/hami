import assert from 'assert';
import { join } from "path";

import { HAMINode } from "@hami-frameworx/core";

import { CoreConfigFSOpts, CoreConfigFSStorage } from "../types.js";
import { CONFIG_FILE_NAME, fetchConfig, USER_CONFIG_FILE_NAME, writeConfig } from "./common.js";

type CoreConfigFSRemoveNodeInput = {
    opts?: CoreConfigFSOpts;
    hamiDirectory?: string;
    userHamiDirectory?: string;
    target: 'global' | 'local';
    configKey?: string;
    configDir?: string;
    configPath?: string;
}

type CoreConfigFSRemoveNodeOutput = any;

class CoreConfigFSRemoveNode extends HAMINode<CoreConfigFSStorage> {
    kind(): string {
        return "core-config-fs:remove";
    }

    async prep(
        shared: CoreConfigFSStorage,
    ): Promise<CoreConfigFSRemoveNodeInput> {
        assert(shared.target, 'target is required');
        assert(shared.configKey, 'configKey is required');
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
            configDir,
            configPath,
        };
    }

    async exec(
        params: CoreConfigFSRemoveNodeInput,
    ): Promise<CoreConfigFSRemoveNodeOutput> {
        const verbose = !!params?.opts?.verbose;
        let config: Record<string, any> = await fetchConfig(params.configPath!);
        let previousValue = config[params.configKey!];
        delete config[params.configKey!];
        await writeConfig(
            params.configDir!,
            params.configPath!,
            config,
        );
        verbose && console.log(`Config key '${params.configKey}' removed (was: '${previousValue}') in ${params.target} config at ${params.configPath}`);
        return previousValue;
    }

    async post(
        shared: CoreConfigFSStorage,
        _prepRes: CoreConfigFSRemoveNodeInput,
        execRes: CoreConfigFSRemoveNodeOutput,
    ): Promise<string | undefined> {
        if (execRes !== undefined) {
            shared.configValuePrevious = execRes;
        }
        return "default";
    }
}

export {
    CoreConfigFSRemoveNode
};