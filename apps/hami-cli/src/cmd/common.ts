import { homedir } from 'os';
import { join as pathJoin } from 'path';
import { Node } from 'pocketflow';

export function startContext(): Record<string, any> {
  let userHomeDirectory = homedir();
  let context: Record<string, any> = {
    workingDirectory: process.cwd(),
    hamiDirectory: pathJoin(process.cwd(), '.hami'),
    userHomeDirectory: userHomeDirectory,
    userHamiDirectory: pathJoin(userHomeDirectory, '.hami')
  }
  return context;
}

export class ValidateErrorHandlerNode extends Node {
  async prep(shared: Record<string, any>): Promise<void> {
    console.log('Validation failed.');
    console.log('errors:', shared.directoryValidationErrors);
    return;
  }
}