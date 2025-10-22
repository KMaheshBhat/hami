import assert from 'assert';
import { join } from "path";

import { HAMINode } from "@hami-frameworx/core";

import { CoreConfigFSOpts, CoreConfigFSStorage } from "../types.js";
import { CONFIG_FILE_NAME, fetchConfig, USER_CONFIG_FILE_NAME, writeConfig } from "./common.js";

/**
 * Input type for the set operation.
 * Contains options, directory paths, target configuration, and the config key-value pair to set.
 */
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

/**
 * Output type for the set operation.
 * The previous value of the configuration key before it was set.
 */
type CoreConfigFSSetNodeOutput = any;

/**
 * CoreConfigFSSetNode is a core config file system operation node that sets a specific configuration value by key.
 * It extends HAMINode and is used for updating individual config values in local or global config files in HAMI workflows.
 * Supports different targets: 'global' (user home .hami) or 'local' (working directory .hami).
 *
 * Expected shared state inputs:
 * - `shared.target`: The target scope for config setting ('local' or 'global', required).
 * - `shared.configKey`: The configuration key to set (required).
 * - `shared.configValue`: The value to set for the configuration key (required).
 * - `shared.hamiDirectory`: The path to the .hami directory in the working directory (required for local target).
 * - `shared.userHamiDirectory`: The path to the .hami directory in the user's home directory (required for global target).
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.configValuePrevious`: The previous value of the configuration key before it was set (if it existed).
 */
class CoreConfigFSSetNode extends HAMINode<CoreConfigFSStorage> {
    /**
     * Returns the kind identifier for this node, which is 'core-config-fs:set'.
     * @returns The string 'core-config-fs:set'.
     */
    kind(): string {
        return "core-config-fs:set";
    }

    /**
     * Prepares the input parameters for the set operation.
     * Validates required parameters, determines the target config file path,
     * and ensures necessary directories are available for the chosen target.
     * @param shared The shared data object containing target, config key, value, directories, and options.
     * @returns A promise that resolves to the prepared input parameters.
     */
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

    /**
     * Executes the set operation by updating the configuration value for the specified key.
     * Loads the existing config, updates the key-value pair, writes back to file,
     * and returns the previous value with verbose logging if enabled.
     * @param params The prepared input parameters containing target, config key, value, and file paths.
     * @returns A promise that resolves to the previous value of the configuration key.
     */
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

    /**
     * Handles post-execution logic by storing the previous config value in the shared state.
     * Sets the configValuePrevious property for use by subsequent nodes if a previous value existed.
     * @param shared The shared data object to update with the previous config value.
     * @param _prepRes The prepared input parameters (unused in this implementation).
     * @param execRes The execution result containing the previous configuration value.
     * @returns A promise that resolves to 'default' to continue normal flow.
     */
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

