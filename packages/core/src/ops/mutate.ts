import { HAMINode } from '../types.js';

/**
 * Configuration type for the MutateNode.
 * An object containing a mutate function that takes the shared state and mutates it.
 */
export type MutateNodeConfig = {
    mutate: (shared: Record<string, any>) => Promise<void>;
};

/**
 * MutateNode is a core operation node that executes a user-provided function to mutate the shared state.
 * It extends HAMINode and is used for custom state mutations in HAMI workflows.
 *
 * Configuration:
 * - A function that takes the shared state as a parameter and mutates it directly.
 *
 * Expected shared state inputs:
 * - The function will have access to the entire shared state for mutation.
 */
export class MutateNode extends HAMINode<Record<string, any>, MutateNodeConfig> {
    /**
     * Returns the kind identifier for this node, which is 'core:mutate'.
     * @returns The string 'core:mutate'.
     */
    kind(): string {
        return 'core:mutate';
    }

    /**
     * Handles post-execution by executing the configured mutation function on the shared state.
     * @param shared The shared data object to mutate.
     * @param prepRes The prepared result from prep (unused).
     * @returns A promise that resolves to 'default' to continue normal flow.
     */
    async post(shared: Record<string, any>, prepRes: Record<string, any>): Promise<string | undefined> {
        if (this.config) {
            await this.config.mutate(shared);
        }
        return 'default';
    }
}