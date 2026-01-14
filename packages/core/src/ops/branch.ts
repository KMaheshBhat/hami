import { HAMINode } from '../types.js';

/**
 * Configuration type for the BranchNode.
 * An object containing a branch function that takes the shared state and returns a branch name or undefined.
 */
export type BranchNodeConfig = {
    branch: (shared: Record<string, any>) => Promise<string | undefined>;
};

/**
 * BranchNode is a core operation node that executes a user-provided function to determine the next branch in the workflow.
 * It extends HAMINode and is used for conditional branching in HAMI workflows based on shared state.
 *
 * Configuration:
 * - A function that takes the shared state as a parameter and returns a branch name or undefined.
 *
 * Expected shared state inputs:
 * - The function will have access to the entire shared state for evaluation.
 */
export class BranchNode extends HAMINode<Record<string, any>, BranchNodeConfig> {
    /**
     * Returns the kind identifier for this node, which is 'core:branch'.
     * @returns The string 'core:branch'.
     */
    kind(): string {
        return 'core:branch';
    }

    /**
     * Handles post-execution by executing the configured branch function on the shared state.
     * @param shared The shared data object to evaluate.
     * @param prepRes The prepared result from prep (unused).
     * @returns A promise that resolves to the branch name returned by the function or undefined.
     */
    async post(shared: Record<string, any>, prepRes: Record<string, any>): Promise<string | undefined> {
        if (this.config) {
            return await this.config.branch(shared);
        }
        return 'default';
    }
}