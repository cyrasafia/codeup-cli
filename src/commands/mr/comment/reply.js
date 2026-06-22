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
import {
  buildReplyCommentBody,
  fetchParentComment,
  resolvePatchSetBizId,
} from './helpers.js';

export function registerMrCommentReplyCommand(program) {
  program
    .command('reply')
    .description('Reply to an existing merge request comment')
    .argument(
      '[repoId]',
      'numeric repository ID or namespace/path; omit to infer from git remote',
    )
    .argument(
      '[localId]',
      'merge request local ID; with two args this is the second (repo first)',
    )
    .requiredOption('--parent <commentBizId>', 'comment to reply to')
    .option('-c, --comment <text>', 'reply content')
    .option('--draft', 'create as draft comment')
    .option('--remote <name>', 'git remote when repo is omitted', 'origin')
    .option('--json', 'print raw JSON response')
    .action(async (repoArg, localId, opts) => {
      if (!opts.comment) {
        throw new Error('Reply content is required. Use -c or --comment.');
      }

      const { repoArg: repoRefArg, localId: mrLocalId } =
        normalizeMrRepoAndLocalId(repoArg, localId);

      const cfg = loadConfig();
      const repoRef = await resolveMrRepoRef(repoRefArg, opts, cfg);

      const parent = await fetchParentComment(
        repoRef,
        mrLocalId,
        opts.parent,
        cfg,
      );
      if (!parent) {
        throw new Error(`Comment not found: ${opts.parent}`);
      }

      const body = buildReplyCommentBody(parent, opts.comment, {
        draft: Boolean(opts.draft),
      });
      if (!body.patchset_biz_id) {
        body.patchset_biz_id = await resolvePatchSetBizId(
          repoRef,
          mrLocalId,
          parent,
          cfg,
        );
      }

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

      printSection('Comment replied');
      printKeyValue(pickCommentSummary(data));
    });
}
