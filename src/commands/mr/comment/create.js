import { api } from '../../../client.js';
import { loadConfig } from '../../../config.js';
import {
  pickCommentSummary,
  printJson,
  printKeyValue,
  printSection,
} from '../../../format.js';
import {
  resolveMrRepoRef,
  normalizeMrRepoAndLocalId,
} from '../../shared/mr-repo-resolve.js';
import { buildGlobalCommentBody } from './helpers.js';

export function registerMrCommentCreateCommand(program) {
  program
    .command('create')
    .description('Create a top-level global comment on a merge request')
    .argument(
      '[repoId]',
      'numeric repository ID or namespace/path; omit to infer from git remote',
    )
    .argument(
      '[localId]',
      'merge request local ID; with two args this is the second (repo first)',
    )
    .option('-c, --comment <text>', 'comment content')
    .option('--draft', 'create as draft comment')
    .option('--remote <name>', 'git remote when repo is omitted', 'origin')
    .option('--json', 'print raw JSON response')
    .action(async (repoArg, localId, opts) => {
      if (!opts.comment) {
        throw new Error('Comment content is required. Use -c or --comment.');
      }

      const { repoArg: repoRefArg, localId: mrLocalId } =
        normalizeMrRepoAndLocalId(repoArg, localId);

      const cfg = loadConfig();
      const repoRef = await resolveMrRepoRef(repoRefArg, opts, cfg);

      const body = await buildGlobalCommentBody(
        repoRef,
        mrLocalId,
        opts.comment,
        { draft: Boolean(opts.draft) },
        cfg,
      );

      const { data } = await api.createChangeRequestComment(
        repoRef,
        mrLocalId,
        body,
        cfg,
      );

      if (opts.json) {
        printJson(data);
        return;
      }

      printSection('Comment created');
      printKeyValue(pickCommentSummary(data));
    });
}
