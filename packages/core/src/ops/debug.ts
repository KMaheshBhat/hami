import { HAMINode } from '../types.js';

/**
 * DebugNode is a core operation node that logs the prepared shared data to the console.
 * It extends HAMINode and is used for debugging purposes in HAMI workflows.
 */
export class DebugNode extends HAMINode<Record<string, any>> {
    /**
     * Returns the kind identifier for this node, which is 'core:debug'.
     * @returns The string 'core:debug'.
     */
    kind(): string {
        return 'core:debug';
    }

    /**
     * Prepares the shared data by returning it unchanged.
     * This method is called during the preparation phase of the node execution.
     * @param shared The shared data object passed to the node.
     * @returns A promise that resolves to the shared data.
     */
    async prep(shared: Record<string, any>): Promise<Record<string, any>> {
        return shared;
    }

    /**
     * Executes the debug operation by logging the prepared result to the console.
     * The result is stringified as JSON with indentation for readability.
     * @param prepRes The prepared result from the prep method.
     * @returns A promise that resolves when the logging is complete.
     */
    async exec(prepRes: Record<string, any>): Promise<void> {
        console.log(JSON.stringify(prepRes, null, 2));
    }
}