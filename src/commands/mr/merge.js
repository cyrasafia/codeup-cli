import { api } from '../../client.js';
import { loadConfig } from '../../config.js';
import {
  pickChangeRequestSummary,
  printJson,
  printKeyValue,
  printSection,
} from '../../format.js';
import { resolveMrRepoRef } from '../shared/mr-repo-resolve.js';

const VALID_MERGE_TYPES = new Set([
  'ff-only',
  'no-fast-forward',
  'squash',
  'rebase',
]);

export function registerMrMergeCommand(program) {
  program
    .command('merge')
    .description('Merge a merge request')
    .argument(
      '[repoId]',
      'numeric repository ID or namespace/path; omit to infer from git remote',
    )
    .argument('<localId>', 'merge request local ID within the repository')
    .option(
      '--type <t>',
      'merge type: ff-only | no-fast-forward | squash | rebase (default: no-fast-forward)',
      'no-fast-forward',
    )
    .option('-m, --message <text>', 'merge commit message')
    .option('--remove-source-branch', 'delete source branch after merge')
    .option('--remote <name>', 'git remote when repo is omitted', 'origin')
    .option('--json', 'print raw JSON response')
    .action(async (repoArg, localId, opts) => {
      if (!VALID_MERGE_TYPES.has(opts.type)) {
        throw new Error(
          `--type must be one of: ${[...VALID_MERGE_TYPES].join(', ')}`,
        );
      }

      const cfg = loadConfig();
      const repoRef = await resolveMrRepoRef(repoArg, opts, cfg);

      const body = {
        mergeType: opts.type,
      };
      if (opts.message) body.mergeMessage = opts.message;
      if (opts.removeSourceBranch) body.removeSourceBranch = true;

      const { data } = await api.mergeChangeRequest(repoRef, localId, body, cfg);

      if (opts.json) {
        printJson(data);
        return;
      }

      printSection('Merge request merged');
      printKeyValue(pickChangeRequestSummary(data));
    });
}
