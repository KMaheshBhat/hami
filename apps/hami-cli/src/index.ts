#!/usr/bin/env node

import { Command } from 'commander';
import packageJson from '../package.json' with { type: 'json' };
import { handleInit } from './cmd/init.js';
import { handleGet, handleGetAll, handleSet, handleRemove } from './cmd/config.js';
import { config } from 'process';

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
    await handleInit(opts);
  });
program.addCommand(cmdInit);

let cmdConfig = new Command('config')
  .description('Manage HAMI CLI configuration')
  .argument('[key]', 'Configuration key')
  .argument('[value]', 'Configuration value')
  .option('-g, --global', 'Use global configuration instead of local')
  .option('-r, --remove', 'Remove the specified configuration key')
  .action(async (key: string | undefined, value: string | undefined, options: any) => {
    try {
      const isVerbose = !!program.opts().verbose;
      const opts = { verbose: isVerbose };
      const target = options.global ? 'global' : 'local';
      const isRemove = !!options.remove;
      const isGet = !!key && !value && !isRemove;
      const isSet = !!key && !!value && !isRemove;
      isVerbose && console.log(`Config command called with key=${key}, value=${value}, target=${target}, isRemove=${isRemove}, isGet=${isGet}, isSet=${isSet}`);
      if (isRemove && !key) {
        console.log('Key is required for remove operation');
        cmdConfig.help();
        return;
      }
      if (isSet && !key && !value) {
        console.log('Both key and value are required for set operation');
        cmdConfig.help();
        return;
      }
      if (!isGet && !isSet && !isRemove) {
        await handleGetAll(
          opts,
          {
            target,
          },
        );
      } else if (isGet) {
        await handleGet(
          opts,
          {
            target,
            configKey: key,
          },
        );
      } else if (isSet) {
        await handleSet(
          opts,
          {
            target,
            configKey: key,
            configValue: value,
          },
        );
      } else if (isRemove) {
        await handleRemove(
          opts,
          {
            target,
            configKey: key,
          },
        );
      }
    } catch (error) {
      console.log('Error handling config command:', error);
      process.exit(1);
    }
  });
program.addCommand(cmdConfig);

program.parse();