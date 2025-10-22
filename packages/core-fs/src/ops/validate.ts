import { promises as fs } from 'fs';

import { HAMINode } from "@hami-frameworx/core";

import { CoreFSOpts, CoreFSSharedStorage } from "../types.js";

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

type ValidateNodeOutput = string[];

class ValidateNode extends HAMINode<CoreFSSharedStorage> {
    kind(): string {
        return "core-fs:validate-hami";
    }

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