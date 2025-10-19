import { HAMINode } from '../types.js';

export class DebugNode extends HAMINode<Record<string, any>> {
    kind(): string {
        return 'core:debug';
    }

    async prep(shared: Record<string, any>): Promise<Record<string, any>> {
        return shared;
    }

    async exec(prepRes: Record<string, any>): Promise<void> {
        console.log(JSON.stringify(prepRes, null, 2));
    }
}