import { HAMINode } from '../types.js';

/**
 * Configuration type for the MapNode.
 * A record where keys are output property names and values are input property paths (dot-notation supported).
 */
export type MapNodeConfig = Record<string, string>;

/**
 * MapNode is a core operation node that maps properties from the shared state to new keys
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
 * - `shared.mapConfig` (optional): Additional mapping configuration that can override or extend
 *   the node's static configuration.
 */
export class MapNode extends HAMINode<Record<string, any>, MapNodeConfig> {
    /**
     * Returns the kind identifier for this node, which is 'core:map'.
     * @returns The string 'core:map'.
     */
    kind(): string {
        return 'core:map';
    }

    /**
     * Prepares the mapping by extracting values from the shared state using configured paths.
     * Merges static configuration with any dynamic mapConfig from shared state.
     * Only includes properties that have truthy values in the output.
     * @param shared The shared data object containing input properties.
     * @returns A promise that resolves to an object with mapped properties.
     */
    async prep(shared: Record<string, any>): Promise<Record<string, any>> {
        const output: Record<string, any> = {};
        const mapConfig: Record<string, string> = {
            ...this.config!,
            ...shared.mapConfig,
        };
        for (const [outputKey, inputPath] of Object.entries(mapConfig)) {
            const value = getNestedProperty(shared, inputPath);
            if (value) {
                output[outputKey] = value;
            }
        }
        return output;
    }

    /**
     * Handles post-execution by merging the mapped results back into the shared state.
     * Each mapped property is added to the shared state under its output key.
     * @param shared The shared data object to update.
     * @param prepRes The prepared mapping results from the prep method.
     * @param _execRes The execution result (unused in this implementation).
     * @returns A promise that resolves to 'default' to continue normal flow.
     */
    async post(shared: Record<string, any>, prepRes: Record<string, any>, _execRes: unknown): Promise<string | undefined> {
        for (const [outputKey, outputValue] of Object.entries(prepRes)) {
            shared[outputKey] = outputValue;
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
function getNestedProperty(obj: Record<string, any>, path: string): any {
    if (!obj || !path || typeof obj !== 'object' || typeof path !== 'string') {
        return undefined;
    }
    const keys = path.split('.');
    return keys.reduce((currentObj, key) =>
        (currentObj && typeof currentObj === 'object') ? currentObj[key] : undefined
        , obj);
}