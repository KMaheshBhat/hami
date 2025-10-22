#!/usr/bin/env node

import { Command } from 'commander';
import { homedir } from 'os';
import { join as pathJoin } from 'path';

import { CoreFSOpts } from "@hami-frameworx/core-fs";

import packageJson from '../package.json' with { type: 'json' };
import { bootstrap } from './bootstrap.js';
import {
  ConfigGetFlow,
  ConfigListFlow,
  ConfigRemoveFlow,
  ConfigSetFlow,
  FlowInitFlow,
  FlowListFlow,
  FlowRemoveFlow,
  FlowRunFlow,
  InitFlow,
  TraceGrepFlow,
  TraceListFlow,
  TraceShowFlow,
} from "./ops/index.js";

function startContext(): Record<string, any> {
  let userHomeDirectory = homedir();
  let context: Record<string, any> = {
    workingDirectory: process.cwd(),
    hamiDirectory: pathJoin(process.cwd(), '.hami'),
    userHomeDirectory: userHomeDirectory,
    userHamiDirectory: pathJoin(userHomeDirectory, '.hami')
  }
  return context;
}

const { registry } = await bootstrap();
const program = new Command();

program
  .name('hami')
  .description('Human Agent Machine Interface CLI')
  .option('--verbose', 'Enable verbose logging')
  .version(packageJson.version);

let cmdInit = new Command('init')
  .description('Initialize a new HAMI working directory')
  .action(async () => {
    try {
      const opts = { verbose: !!program.opts().verbose };
      const initFlow = new InitFlow({
        coreFSStrategy: 'CWD',
      });
      await initFlow.run({
        registry: registry,
        opts: opts as CoreFSOpts,
      });
    } catch (error) {
      console.log('Error handling init command:', error);
      process.exit(1);
    }
  });
program.addCommand(cmdInit);

let cmdConfig = new Command('config')
  .description('Manage HAMI CLI configuration')
  .option('-g, --global', 'Use global configuration instead of local')
  .addCommand(
    new Command('list')
      .description('List all configuration values')
      .action(async () => {
        try {
          const isVerbose = !!program.opts().verbose;
          const isGlobal = !!cmdConfig.opts().global;
          const opts = { verbose: isVerbose };
          const target = isGlobal ? 'global' : 'local';
          const configListFlow = new ConfigListFlow({
            coreFSStrategy: 'CWD',
            verbose: opts.verbose,
          });
          await configListFlow.run({
            registry: registry,
            opts: opts,
            ...startContext(),
            target,
          });
        } catch (error) {
          console.log('Error handling config list command:', error);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command('get')
      .description('Get a configuration value')
      .argument('<key>', 'Configuration key')
      .action(async (key: string) => {
        try {
          const isVerbose = !!program.opts().verbose;
          const isGlobal = !!cmdConfig.opts().global;
          const opts = { verbose: isVerbose };
          const target = isGlobal ? 'global' : 'local';
          const configGetFlow = new ConfigGetFlow({
            coreFSStrategy: 'CWD',
            verbose: opts.verbose,
          });
          await configGetFlow.run({
            registry: registry,
            opts: opts,
            ...startContext(),
            target,
            configKey: key,
          });
        } catch (error) {
          console.log('Error handling config get command:', error);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command('set')
      .description('Set a configuration value')
      .argument('<key>', 'Configuration key')
      .argument('<value>', 'Configuration value')
      .action(async (key: string, value: string) => {
        try {
          const isVerbose = !!program.opts().verbose;
          const isGlobal = !!cmdConfig.opts().global;
          const opts = { verbose: isVerbose };
          const target = isGlobal ? 'global' : 'local';
          const configSetFlow = new ConfigSetFlow({
            coreFSStrategy: 'CWD',
            target,
            configKey: key,
            configValue: value,
          });
          await configSetFlow.run({
            registry: registry,
            opts: opts,
            ...startContext(),
            target,
            configKey: key,
            configValue: value,
          });
        } catch (error) {
          console.log('Error handling config set command:', error);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command('remove')
      .description('Remove a configuration key')
      .argument('<key>', 'Configuration key')
      .action(async (key: string) => {
        try {
          const isVerbose = !!program.opts().verbose;
          const isGlobal = !!cmdConfig.opts().global;
          const opts = { verbose: isVerbose };
          const target = isGlobal ? 'global' : 'local';
          const configRemoveFlow = new ConfigRemoveFlow({
            coreFSStrategy: 'CWD',
            target,
            configKey: key,
          });
          await configRemoveFlow.run({
            registry: registry,
            opts: opts,
            ...startContext(),
            target,
            configKey: key,
          });
        } catch (error) {
          console.log('Error handling config remove command:', error);
          process.exit(1);
        }
      }),
  );
program.addCommand(cmdConfig);

let cmdTrace = new Command('trace')
  .description('Inspect operation history and traces')
  .addCommand(
    new Command('list')
      .description('List all operations in the workflow index')
      .action(async () => {
        try {
          const isVerbose = !!program.opts().verbose;
          const opts = { verbose: isVerbose };
          const traceListFlow = new TraceListFlow({
            coreFSStrategy: 'CWD',
            verbose: opts.verbose,
          });
          await traceListFlow.run({
            registry: registry,
            opts: opts,
            ...startContext(),
          });
        } catch (error) {
          console.log('Error handling trace list command:', error);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command('show')
      .description('Show details of a specific trace')
      .argument('<traceId>', 'Trace ID to show')
      .action(async (traceId: string) => {
        try {
          const isVerbose = !!program.opts().verbose;
          const opts = { verbose: isVerbose };
          const traceShowFlow = new TraceShowFlow({
            coreFSStrategy: 'CWD',
            verbose: opts.verbose,
            traceId: traceId,
          });
          await traceShowFlow.run({
            registry: registry,
            opts: opts,
            traceId: traceId,
            ...startContext(),
          });
        } catch (error) {
          console.log('Error handling trace show command:', error);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command('grep')
      .description('Search traces for a query string')
      .argument('<query>', 'Search query to match in traces')
      .action(async (query: string) => {
        try {
          const isVerbose = !!program.opts().verbose;
          const opts = { verbose: isVerbose };
          const traceGrepFlow = new TraceGrepFlow({
            coreFSStrategy: 'CWD',
            verbose: opts.verbose,
            searchQuery: query,
          });
          await traceGrepFlow.run({
            registry: registry,
            opts: opts,
            searchQuery: query,
            ...startContext(),
          });
        } catch (error) {
          console.log('Error handling trace grep command:', error);
          process.exit(1);
        }
      }),
  );
program.addCommand(cmdTrace);

let cmdFlow = new Command('flow')
  .description('Manage HAMI flows')
  .option('-g, --global', 'Use global configuration instead of local')
  .addCommand(
    new Command('init')
      .description('Initialize a new flow configuration')
      .argument('<name>', 'Flow name')
      .argument('<kind>', 'Flow kind')
      .argument('<config>', 'Flow configuration as JSON string')
      .argument('[resultKey]', 'Flow result key (optional)')
      .action(async (name: string, kind: string, config: string, resultKey?: string) => {
        try {
          const isVerbose = !!program.opts().verbose;
          const isGlobal = !!cmdFlow.opts().global;
          const opts = { verbose: isVerbose, global: isGlobal };
          const parsedConfig = JSON.parse(config);
          const flowInitFlow = new FlowInitFlow({
            coreFSStrategy: 'CWD',
            target: opts.global ? 'global' : 'local',
            name: name,
            kind: kind,
            config: parsedConfig,
          });
          await flowInitFlow.run({
            registry: registry,
            opts: opts,
            ...startContext(),
            target: opts.global ? 'global' : 'local',
            configKey: `flow:${name}`,
            configValue: { 
              kind,
              config: parsedConfig,
              resultKey: resultKey || undefined,
             },
          });
        } catch (error) {
          console.log('Error handling flow init command:', error);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command('run')
      .description('Run a configured flow')
      .argument('<name>', 'Flow name to run')
      .argument('[payload]', 'JSON payload to pass to the flow')
      .action(async (name: string, payload: string | undefined) => {
        try {
          const isVerbose = !!program.opts().verbose;
          const isGlobal = !!cmdFlow.opts().global;
          const opts = { verbose: isVerbose, global: isGlobal };
          const parsedPayload = payload ? JSON.parse(payload) : undefined;
          const flowRunFlow = new FlowRunFlow({
            coreFSStrategy: 'CWD',
            target: opts.global ? 'global' : 'local',
            name: name,
            verbose: opts.verbose,
            payload: parsedPayload,
          });
          await flowRunFlow.run({
            registry: registry,
            coreFSStrategy: 'CWD',
            opts: opts,
            ...startContext(),
            target: opts.global ? 'global' : 'local',
            configKey: `flow:${name}`,
            ...parsedPayload,
          });
        } catch (error) {
          console.log('Error handling flow run command:', error);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command('remove')
      .description('Remove a configured flow')
      .argument('<name>', 'Flow name to remove')
      .action(async (name: string) => {
        try {
          const isVerbose = !!program.opts().verbose;
          const isGlobal = !!cmdFlow.opts().global;
          const opts = { verbose: isVerbose, global: isGlobal };
          const flowRemoveFlow = new FlowRemoveFlow({
            coreFSStrategy: 'CWD',
            target: opts.global ? 'global' : 'local',
            name: name,
          });
          await flowRemoveFlow.run({
            registry: registry,
            opts: opts,
            ...startContext(),
            target: opts.global ? 'global' : 'local',
            configKey: `flow:${name}`,
          });
        } catch (error) {
          console.log('Error handling flow remove command:', error);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command('list')
      .description('List all configured flows')
      .action(async () => {
        try {
          const isVerbose = !!program.opts().verbose;
          const isGlobal = !!cmdFlow.opts().global;
          const opts = { verbose: isVerbose, global: isGlobal };
          const flowListFlow = new FlowListFlow({
            coreFSStrategy: 'CWD',
            target: opts.global ? 'global' : 'local',
            verbose: opts.verbose,
          });
          await flowListFlow.run({
            registry: registry,
            opts: opts,
            ...startContext(),
            target: opts.global ? 'global' : 'local',
          });
        } catch (error) {
          console.log('Error handling flow list command:', error);
          process.exit(1);
        }
      }),
  );
program.addCommand(cmdFlow);

program.parse();