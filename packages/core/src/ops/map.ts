import { HAMINode } from '../types.js';

export type MapNodeConfig = Record<string, string>;

export class MapNode extends HAMINode<Record<string, any>, MapNodeConfig> {
    kind(): string {
        return 'core:map';
    }

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

    async post(shared: Record<string, any>, prepRes: Record<string, any>, _execRes: unknown): Promise<string | undefined> {
        for (const [outputKey, outputValue] of Object.entries(prepRes)) {
            shared[outputKey] = outputValue;
        }
        return 'default';
    }
}

function getNestedProperty(obj: Record<string, any>, path: string): any {
    if (!obj || !path || typeof obj !== 'object' || typeof path !== 'string') {
        return undefined;
    }
    const keys = path.split('.');
    return keys.reduce((currentObj, key) =>
        (currentObj && typeof currentObj === 'object') ? currentObj[key] : undefined
        , obj);
}