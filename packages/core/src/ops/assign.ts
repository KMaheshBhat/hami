import { HAMINode } from '../types.js';

/**
 * Configuration type for the AssignNode.
 * A record where keys are output property names and values are input property paths (dot-notation supported).
 */
export type AssignNodeConfig = Record<string, string>;

/**
 * AssignNode is a core operation node that assigns properties from the shared state to new keys
 * using configurable property paths. It extends HAMINode and is used for data transformation
 * and property remapping in HAMI workflows.
 *
 * Configuration:
 * - A record where each key is the desired output property name and each value is a dot-notation
 *   path to the input property in the shared state (e.g., { "newKey": "oldKey.subKey" }).
 *
 * Expected shared state inputs:
 * - Properties referenced by the configuration paths (e.g., if config has "output": "input.nested",
 *   then shared.input.nested should exist).
 * - `shared.assignConfig` (optional): Additional assignment configuration that can override or extend
 *   the node's static configuration.
 */
export class AssignNode extends HAMINode<Record<string, any>, AssignNodeConfig> {
    /**
     * Returns the kind identifier for this node, which is 'core:assign'.
     * @returns The string 'core:assign'.
     */
    kind(): string {
        return 'core:assign';
    }

    /**
     * Prepares the assignment by extracting values from the shared state using configured paths.
     * Merges static configuration with any dynamic assignConfig from shared state.
     * Only includes properties that have truthy values in the output.
     * @param shared The shared data object containing input properties.
     * @returns A promise that resolves to an object with assigned properties.
     */
    async prep(shared: Record<string, any>): Promise<Record<string, any>> {
        const output: Record<string, any> = {};
        const assignConfig: Record<string, string> = {
            ...this.config!,
            ...shared.assignConfig,
        };
        for (const [outputKey, inputPath] of Object.entries(assignConfig)) {
            const value = getNestedProperty(shared, inputPath);
            if (value) {
                output[outputKey] = value;
            }
        }
        return output;
    }

    /**
     * Handles post-execution by merging the assigned results back into the shared state.
     * Each assigned property is added to the shared state under its output key.
     * @param shared The shared data object to update.
     * @param prepRes The prepared assignment results from the prep method.
     * @param _execRes The execution result (unused in this implementation).
     * @returns A promise that resolves to 'default' to continue normal flow.
     */
    async post(shared: Record<string, any>, prepRes: Record<string, any>): Promise<string | undefined> {
        for (const [targetPath, value] of Object.entries(prepRes)) {
            setNestedProperty(shared, targetPath, value);
        }
        return 'default';
    }
}

/**
 * Retrieves a nested property from an object using dot-notation path.
 * Safely navigates object properties without throwing errors for undefined paths.
 * @param obj The object to extract the property from.
 * @param path The dot-notation path to the property (e.g., "prop.subprop").
 * @returns The value at the specified path, or undefined if the path doesn't exist.
 */
function getNestedProperty(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    const keys = path.split('.');
    return keys.reduce((current, key) => 
        (current && typeof current === 'object') ? current[key] : undefined, obj);
}

/**
 * Safely sets a nested property using dot-notation, creating intermediate objects if needed.
 */
function setNestedProperty(obj: any, path: string, value: any): void {
    if (!obj || !path) return;
    
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    const targetObj = keys.reduce((current, key) => {
        if (!(key in current) || current[key] === null || typeof current[key] !== 'object') {
            current[key] = {};
        }
        return current[key];
    }, obj);

    targetObj[lastKey] = value;
}