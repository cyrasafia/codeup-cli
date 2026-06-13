#!/usr/bin/env node
import { Command } from 'commander';
import { registerRepoListCommand } from '../src/commands/repo/list.js';
import { registerRepoGetCommand } from '../src/commands/repo/get.js';
import { registerRepoCreateCommand } from '../src/commands/repo/create.js';
import { registerRepoUpdateCommand } from '../src/commands/repo/update.js';
import { registerMrCreateCommand } from '../src/commands/mr/create.js';
import { registerMrListCommand } from '../src/commands/mr/list.js';
import { registerMrGetCommand } from '../src/commands/mr/get.js';
import { registerMrUpdateCommand } from '../src/commands/mr/update.js';
import { registerMrReviewCommand } from '../src/commands/mr/review.js';
import { registerMrMergeCommand } from '../src/commands/mr/merge.js';
import { registerConfigCommand } from '../src/commands/config.js';

const program = new Command();

program
  .name('codeup')
  .description('CLI for Aliyun Yunxiao Codeup repository management')
  .version('0.1.0');

const repo = program
  .command('repo')
  .description('Repository management');

registerRepoListCommand(repo);
registerRepoGetCommand(repo);
registerRepoCreateCommand(repo);
registerRepoUpdateCommand(repo);

const mr = program
  .command('mr')
  .description('Merge request management');

registerMrCreateCommand(mr);
registerMrListCommand(mr);
registerMrGetCommand(mr);
registerMrUpdateCommand(mr);
registerMrReviewCommand(mr);
registerMrMergeCommand(mr);

registerConfigCommand(program);

program.parseAsync(process.argv).catch((err) => {
  const msg = err && err.message ? err.message : String(err);
  process.stderr.write(`error: ${msg}\n`);
  process.exit(1);
});
