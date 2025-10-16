#!/usr/bin/env node

import { Command } from 'commander';

import packageJson from '../package.json' with { type: 'json' };
import { bootstrap } from './bootstrap.js';
import { handleConfigGet, handleConfigList, handleConfigRemove, handleConfigSet } from './cmd/config.js';
import { handleFlowInit, handleFlowList, handleFlowRemove, handleFlowRun } from './cmd/flow.js';
import { handleInit } from './cmd/init.js';
import { handleTraceGrep, handleTraceList, handleTraceShow } from './cmd/trace.js';

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
    const opts = { verbose: !!program.opts().verbose };
    await handleInit(registry, opts);
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
          await handleConfigList(
            registry,
            opts,
            {
              target,
            },
          );
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
          await handleConfigGet(
            registry,
            opts,
            {
              target,
              configKey: key,
            },
          );
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
          await handleConfigSet(
            registry,
            opts,
            {
              target,
              configKey: key,
              configValue: value,
            },
          );
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
          await handleConfigRemove(
            registry,
            opts,
            {
              target,
              configKey: key,
            },
          );
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
          await handleTraceList(registry, opts);
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
          await handleTraceShow(registry, opts, traceId);
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
          await handleTraceGrep(registry, opts, query);
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
      .action(async (name: string, kind: string, config: string) => {
        try {
          const isVerbose = !!program.opts().verbose;
          const isGlobal = !!cmdFlow.opts().global;
          const opts = { verbose: isVerbose, global: isGlobal };
          const parsedConfig = JSON.parse(config);
          await handleFlowInit(registry, opts, name, kind, parsedConfig);
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
          await handleFlowRun(registry, opts, name, parsedPayload);
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
          await handleFlowRemove(registry, opts, name);
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
          await handleFlowList(registry, opts);
        } catch (error) {
          console.log('Error handling flow list command:', error);
          process.exit(1);
        }
      }),
  );
program.addCommand(cmdFlow);

program.parse();