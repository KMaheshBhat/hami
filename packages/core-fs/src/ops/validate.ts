import { promises as fs } from 'fs';

import { HAMINode } from "@hami-frameworx/core";

import { CoreFSOpts, CoreFSSharedStorage } from "../types.js";

/**
 * Input type for the validate operation.
 * Contains flags for which directories to check and the directory paths to validate.
 */
type ValidateNodeInput = {
    checkWorkingDirectory?: boolean;
    checkHamiDirectory?: boolean;
    checkUserHomeDirectory?: boolean;
    checkUserHamiDirectory?: boolean;
    workingDirectory?: string;
    hamiDirectory?: string;
    userHomeDirectory?: string;
    userHamiDirectory?: string;
    opts?: CoreFSOpts;
}

/**
 * Output type for the validate operation.
 * An array of error messages for any directories that failed validation.
 */
type ValidateNodeOutput = string[];

/**
 * ValidateNode is a core file system operation node that validates the existence of HAMI directories.
 * It extends HAMINode and is used for checking that required directories exist in HAMI workflows.
 * This node pairs with InitWorkingDirectoryNode to ensure proper setup.
 *
 * Expected shared state inputs:
 * - `shared.workingDirectory`: The working directory path to validate.
 * - `shared.hamiDirectory`: The .hami directory path in working directory to validate.
 * - `shared.userHomeDirectory`: The user home directory path to validate.
 * - `shared.userHamiDirectory`: The .hami directory path in user home to validate.
 * - `shared.checkWorkingDirectory` (optional): Whether to check working directory (defaults to true).
 * - `shared.checkHamiDirectory` (optional): Whether to check hami directory (defaults to true).
 * - `shared.checkUserHomeDirectory` (optional): Whether to check user home directory (defaults to true).
 * - `shared.checkUserHamiDirectory` (optional): Whether to check user hami directory (defaults to true).
 * - `shared.opts`: Optional configuration including verbose logging flag.
 *
 * Expected shared state outputs (on validation failure):
 * - `shared.directoryValidationErrors`: An array of error messages for failed validations.
 */
class ValidateNode extends HAMINode<CoreFSSharedStorage> {
    /**
     * Returns the kind identifier for this node, which is 'core-fs:validate-hami'.
     * @returns The string 'core-fs:validate-hami'.
     */
    kind(): string {
        return "core-fs:validate-hami";
    }

    /**
     * Prepares the input parameters for the validate operation.
     * Retrieves validation flags and directory paths from shared state,
     * with defaults for check flags set to true.
     * @param shared The shared data object containing directory paths and validation flags.
     * @returns A promise that resolves to the prepared input parameters.
     */
    async prep(
        shared: CoreFSSharedStorage,
    ): Promise<ValidateNodeInput> {
        const {
            checkWorkingDirectory = true,
            checkHamiDirectory = true,
            checkUserHomeDirectory = true,
            checkUserHamiDirectory = true,
        } = {
            ...shared,
        }
        return {
            checkHamiDirectory,
            checkUserHomeDirectory,
            checkUserHamiDirectory,
            checkWorkingDirectory,
            workingDirectory: shared.workingDirectory,
            hamiDirectory: shared.hamiDirectory,
            userHomeDirectory: shared.userHomeDirectory,
            userHamiDirectory: shared.userHamiDirectory,
            opts: shared.opts,
        };
    }

    /**
     * Executes the validation operation by checking the existence of configured directories.
     * Performs checks for working directory, hami directory, user home directory, and user hami directory
     * based on the check flags, logging verbose output and collecting any errors found.
     * @param params The prepared input parameters containing check flags and directory paths.
     * @returns A promise that resolves to an array of error messages for failed validations.
     */
    async exec(
        params: ValidateNodeInput,
    ): Promise<ValidateNodeOutput> {
        const verbose = !!params?.opts?.verbose;
        let errors: string[] = [];
        if (params.checkWorkingDirectory) {
            verbose && console.log('checking workingDirectory');
            const error = await checkDirectory(params, 'workingDirectory');
            if (error) {
                errors.push(error);
            }
        }
        if (params.checkHamiDirectory) {
            verbose && console.log('checking hamiDirectory');
            const error = await checkDirectory(params, 'hamiDirectory');
            if (error) {
                errors.push(error);
            }
        }
        if (params.checkUserHomeDirectory) {
            verbose && console.log('checking userHomeDirectory');
            const error = await checkDirectory(params, 'userHomeDirectory');
            if (error) {
                errors.push(error);
            }
        }
        if (params.checkUserHamiDirectory) {
            verbose && console.log('checking userHamiDirectory');
            const error = await checkDirectory(params, 'userHamiDirectory');
            if (error) {
                errors.push(error);
            }
        }
        return errors;
    }

    /**
     * Handles post-execution logic by determining the flow based on validation results.
     * If no errors are found, continues with default flow. If errors exist,
     * stores them in shared state and returns 'error' to trigger error handling.
     * @param shared The shared data object to update with validation errors if any.
     * @param _prepRes The prepared input parameters (unused in this implementation).
     * @param execRes The execution result containing validation error messages.
     * @returns A promise that resolves to 'default' if validation passed, 'error' if failed.
     */
    async post(
        shared: CoreFSSharedStorage,
        _prepRes: ValidateNodeInput,
        execRes: ValidateNodeOutput,
    ): Promise<string | undefined> {
        if (execRes.length === 0) {
            return "default";
        }
        shared.directoryValidationErrors = execRes;
        return "error";
    }
}

/**
 * Helper function to check if a directory exists at the specified path.
 * Validates that the directory path is set and accessible, logging verbose output.
 * @param params The validation input parameters containing directory paths and options.
 * @param directoryKey The key of the directory to check in the params object.
 * @returns A promise that resolves to an error message if validation fails, or null if successful.
 */
async function checkDirectory(
    params: ValidateNodeInput,
    directoryKey: string,
) : Promise<string | null> {
    const verbose = !!params?.opts?.verbose;
    let error: string | null = null;
    const key = directoryKey as keyof ValidateNodeInput;
    if (!params[key]) {
        error = `${directoryKey} is not set`;
        verbose && console.log(error);
    } else {
        verbose && console.log(`${directoryKey} is set to ${params[key]}`);
        try {
            await fs.access(params[key] as string);
            verbose && console.log(`${directoryKey} exists at ${params[key]}`);
            return null;
        } catch {
            error = `${directoryKey} does not exist at ${params[key]}`;
            verbose && console.log(error);
        }
    }
    return error;
}

export {
    ValidateNode,
}