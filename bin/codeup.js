#!/usr/bin/env node
import { Command } from 'commander';
import { registerListCommand } from '../src/commands/list.js';
import { registerGetCommand } from '../src/commands/get.js';
import { registerCreateCommand } from '../src/commands/create.js';
import { registerUpdateCommand } from '../src/commands/update.js';
import { registerConfigCommand } from '../src/commands/config.js';

const program = new Command();

program
  .name('codeup')
  .description('CLI for Aliyun Yunxiao Codeup repository management')
  .version('0.1.0');

registerListCommand(program);
registerGetCommand(program);
registerCreateCommand(program);
registerUpdateCommand(program);
registerConfigCommand(program);

program.parseAsync(process.argv).catch((err) => {
  const msg = err && err.message ? err.message : String(err);
  process.stderr.write(`error: ${msg}\n`);
  process.exit(1);
});
