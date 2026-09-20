import { loadConfig } from '../../../config.js';
import {
  pickCommentSummary,
  printCommentTree,
  printJson,
  printKeyValue,
  printSection,
} from '../../../format.js';
import {
  resolveMrRepoRef,
  normalizeMrRepoAndLocalId,
} from '../../shared/mr-repo-resolve.js';
import { fetchCommentByBizId } from './helpers.js';

export function registerMrCommentGetCommand(program) {
  program
    .command('get')
    .description('Show the full content of a merge request comment')
    .argument(
      '[repoId]',
      'numeric repository ID or namespace/path; omit to infer from git remote',
    )
    .argument(
      '[localId]',
      'merge request local ID; with two args this is the second (repo first)',
    )
    .requiredOption('--comment <commentBizId>', 'comment to show')
    .option('--remote <name>', 'git remote when repo is omitted', 'origin')
    .option('--json', 'print raw JSON response')
    .action(async (repoArg, localId, opts) => {
      const { repoArg: repoRefArg, localId: mrLocalId } =
        normalizeMrRepoAndLocalId(repoArg, localId);

      const cfg = loadConfig();
      const repoRef = await resolveMrRepoRef(repoRefArg, opts, cfg);

      const comment = await fetchCommentByBizId(
        repoRef,
        mrLocalId,
        opts.comment,
        cfg,
      );
      if (!comment) {
        throw new Error(`Comment not found: ${opts.comment}`);
      }

      if (opts.json) {
        printJson(comment);
        return;
      }

      printSection(`Comment (MR #${mrLocalId})`);
      printKeyValue(pickCommentSummary(comment));

      const children = comment.child_comments_list;
      if (children && children.length > 0) {
        printSection('Replies');
        printCommentTree(children, { full: true });
      }
    });
}
