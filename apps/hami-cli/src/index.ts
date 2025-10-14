#!/usr/bin/env node

import { Command } from 'commander';
import { greet } from '@hami/core';

const program = new Command();

program
  .name('hami-cli')
  .description('CLI for Hami')
  .version('1.0.0');

program
  .command('greet')
  .description('Print a greeting')
  .action(() => {
    console.log(greet('World'));
  });

program.parse();