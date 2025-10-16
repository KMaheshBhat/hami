import { BaseNode, Flow, Node } from "pocketflow"

export type HAMINodeConfigValidateResult = {
    valid: boolean;
    errors: string[];
}

export abstract class HAMINode<S = unknown, C = unknown> extends Node<S> {
    protected config: C | undefined = undefined;
    constructor(config: C | undefined = undefined, maxRetries: number = 1, wait: number = 0) {
        super(maxRetries, wait);
        this.config = config;
        if (!config) return;
        const validation = this.validateConfig(config);
        if (!validation.valid) {
            throw new Error(
                `Invalid configuration for HAMINode ${this.kind()}`,
                {
                    cause: validation.errors,
                }
            );
        }
    }
    abstract kind(): string;
    validateConfig(_config: C): HAMINodeConfigValidateResult {
        return { valid: true, errors: [] };
    }
}

export abstract class HAMIFlow<S = unknown, C = unknown> extends Flow<S> {
    protected config: C | undefined = undefined;
    constructor(start: BaseNode, config: C) {
        super(start);
        this.config = config;
        if (!config) return;
        const validation = this.validateConfig(config);
        if (!validation.valid) {
            throw new Error(`Invalid configuration for HAMIFlow ${this.kind()}`, {
                cause: validation.errors,
            });
        }
    }
    abstract kind(): string;
    validateConfig(_config: C): HAMINodeConfigValidateResult {
        return { valid: true, errors: [] };
    }
}