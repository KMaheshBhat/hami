import assert from 'assert';
import { join } from "path";

import { HAMINode } from "@hami-frameworx/core";

import { CoreConfigFSOpts, CoreConfigFSStorage } from "../types.js";
import { CONFIG_FILE_NAME, fetchConfig, USER_CONFIG_FILE_NAME } from "./common.js";

/**
 * Input type for the get operation.
 * Contains options, directory paths, target configuration, and the specific config key to retrieve.
 */
type CoreConfigFSGetNodeInput = {
    opts?: CoreConfigFSOpts;
    hamiDirectory?: string;
    userHamiDirectory?: string;
    target: 'global' | 'local' | 'local-and-global';
    configKey?: string;
    configDir?: string;
    configPath?: string;
}

/**
 * Output type for the get operation.
 * The value associated with the requested configuration key.
 */
type CoreConfigFSGetNodeOutput = any;

/**
 * CoreConfigFSGetNode is a core config file system operation node that retrieves a specific configuration value by key.
 * It extends HAMINode and is used for fetching individual config values from local, global, or merged local-and-global sources in HAMI workflows.
 * Supports different targets: 'global' (user home .hami), 'local' (working directory .hami), or 'local-and-global' (local first, then global fallback).
 *
 * Expected shared state inputs:
 * - `shared.target` (optional): The target scope for config retrieval ('local', 'global', or 'local-and-global', defaults to 'local').
 * - `shared.useGlobalFallback` (optional): Whether to fall back to global config when local is requested (defaults to true).
 * - `shared.configKey`: The configuration key to retrieve (required).
 * - `shared.hamiDirectory`: The path to the .hami directory in the working directory (required for local and local-and-global targets).
 * - `shared.userHamiDirectory`: The path to the .hami directory in the user's home directory (required for global and local-and-global targets).
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.configValue`: The value associated with the requested configuration key.
 */
class CoreConfigFSGetNode extends HAMINode<CoreConfigFSStorage> {
    /**
     * Returns the kind identifier for this node, which is 'core-config-fs:get'.
     * @returns The string 'core-config-fs:get'.
     */
    kind(): string {
        return "core-config-fs:get";
    }

    /**
     * Prepares the input parameters for the get operation.
     * Determines the target strategy based on shared state, resolves directory paths,
     * validates required directories and config key for the chosen target.
     * @param shared The shared data object containing target, config key, directories, and options.
     * @returns A promise that resolves to the prepared input parameters.
     */
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

    /**
     * Executes the get operation by fetching the configuration value for the specified key based on the target.
     * Loads config from global, local, or merged sources with fallback logic, with verbose logging if enabled.
     * @param params The prepared input parameters containing target, config key, and directory paths.
     * @returns A promise that resolves to the value associated with the configuration key.
     */
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

    /**
     * Handles post-execution logic by storing the retrieved config value in the shared state.
     * Sets the configValue property for use by subsequent nodes.
     * @param shared The shared data object to update with the config value.
     * @param _prepRes The prepared input parameters (unused in this implementation).
     * @param execRes The execution result containing the configuration value.
     * @returns A promise that resolves to 'default' to continue normal flow.
     */
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
