import { api } from '../../../client.js';
import { loadConfig } from '../../../config.js';
import { printJson, printKeyValue, printSection } from '../../../format.js';
import {
  resolveMrRepoRef,
  normalizeMrRepoAndLocalId,
} from '../../shared/mr-repo-resolve.js';

export function registerMrCommentResolveCommand(program) {
  program
    .command('resolve')
    .description('Mark a merge request comment as resolved or unresolved')
    .argument(
      '[repoId]',
      'numeric repository ID or namespace/path; omit to infer from git remote',
    )
    .argument(
      '[localId]',
      'merge request local ID; with two args this is the second (repo first)',
    )
    .requiredOption('--comment <commentBizId>', 'comment to update')
    .option('--unresolve', 'mark comment as unresolved')
    .option('--remote <name>', 'git remote when repo is omitted', 'origin')
    .option('--json', 'print raw JSON response')
    .action(async (repoArg, localId, opts) => {
      const { repoArg: repoRefArg, localId: mrLocalId } =
        normalizeMrRepoAndLocalId(repoArg, localId);

      const cfg = loadConfig();
      const repoRef = await resolveMrRepoRef(repoRefArg, opts, cfg);

      const body = {
        resolved: !opts.unresolve,
      };

      const { data } = await api.updateChangeRequestComment(
        repoRef,
        mrLocalId,
        opts.comment,
        body,
        cfg,
      );

      if (opts.json) {
        printJson(data);
        return;
      }

      printSection('Comment updated');
      printKeyValue([
        ['Result', data.result],
        ['Comment ID', opts.comment],
        ['Resolved', body.resolved],
        ['Repository', repoRef],
        ['Local ID', mrLocalId],
      ]);
    });
}
