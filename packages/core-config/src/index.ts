import { Node } from "pocketflow";

export function loadConfig(): object {
  return { version: '1.0.0', environment: 'development' };
}

export function validateConfig(config: object): boolean {
  return typeof config === 'object' && config !== null;
}

class HelloNode extends Node {
  async exec(prepRes: unknown): Promise<unknown> {
    console.log('Hello from HelloNode!');
    return prepRes;
  }
}