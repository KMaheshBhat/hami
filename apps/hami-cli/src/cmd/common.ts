import { homedir } from 'os';
import { join as pathJoin } from 'path';

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

