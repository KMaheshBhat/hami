import assert from 'assert';
import { join } from "path";

import { HAMINode } from "@hami-frameworx/core";

import { CoreConfigFSOpts, CoreConfigFSStorage } from "../types.js";
import { CONFIG_FILE_NAME, fetchConfig, USER_CONFIG_FILE_NAME } from "./common.js";

/**
 * Input type for the get-all operation.
 * Contains options, directory paths, and target configuration for fetching all config values.
 */
type CoreConfigFSGetAllNodeInput = {
    opts?: CoreConfigFSOpts;
    hamiDirectory?: string;
    userHamiDirectory?: string;
    target: 'global' | 'local' | 'local-and-global';
    configDir?: string;
    configPath?: string;
}

/**
 * Output type for the get-all operation.
 * A record containing all configuration key-value pairs.
 */
type CoreConfigFSGetAllNodeOutput = Record<string, any>;

/**
 * CoreConfigFSGetAllNode is a core config file system operation node that retrieves all configuration values.
 * It extends HAMINode and is used for fetching all config data from local, global, or merged local-and-global sources in HAMI workflows.
 * Supports different targets: 'global' (user home .hami), 'local' (working directory .hami), or 'local-and-global' (merged with local overriding global).
 *
 * Expected shared state inputs:
 * - `shared.target` (optional): The target scope for config retrieval ('local', 'global', or 'local-and-global', defaults to 'local').
 * - `shared.useGlobalFallback` (optional): Whether to fall back to global config when local is requested (defaults to true).
 * - `shared.hamiDirectory`: The path to the .hami directory in the working directory (required for local and local-and-global targets).
 * - `shared.userHamiDirectory`: The path to the .hami directory in the user's home directory (required for global and local-and-global targets).
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs:
 * - `shared.configValues`: A record containing all retrieved configuration key-value pairs.
 */
class CoreConfigFSGetAllNode extends HAMINode<CoreConfigFSStorage> {
    /**
     * Returns the kind identifier for this node, which is 'core-config-fs:get-all'.
     * @returns The string 'core-config-fs:get-all'.
     */
    kind(): string {
        return "core-config-fs:get-all";
    }

    /**
     * Prepares the input parameters for the get-all operation.
     * Determines the target strategy based on shared state, resolves directory paths,
     * and validates required directories for the chosen target.
     * @param shared The shared data object containing target, directories, and options.
     * @returns A promise that resolves to the prepared input parameters.
     */
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

    /**
     * Executes the get-all operation by fetching configuration data based on the target.
     * Loads config from global, local, or merged sources, with verbose logging if enabled.
     * @param params The prepared input parameters containing target and directory paths.
     * @returns A promise that resolves to a record of all configuration key-value pairs.
     */
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

    /**
     * Handles post-execution logic by storing the retrieved config values in the shared state.
     * Sets the configValues property for use by subsequent nodes.
     * @param shared The shared data object to update with the config values.
     * @param _prepRes The prepared input parameters (unused in this implementation).
     * @param execRes The execution result containing all configuration key-value pairs.
     * @returns A promise that resolves to 'default' to continue normal flow.
     */
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