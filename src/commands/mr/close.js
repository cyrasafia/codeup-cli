import { api } from '../../client.js';
import { loadConfig } from '../../config.js';
import {
  pickChangeRequestSummary,
  printJson,
  printKeyValue,
  printSection,
} from '../../format.js';
import { resolveMrRepoRef, normalizeMrRepoAndLocalId } from '../shared/mr-repo-resolve.js';

export function registerMrCloseCommand(program) {
  program
    .command('close')
    .description('Close a merge request without merging')
    .argument(
      '[repoId]',
      'numeric repository ID or namespace/path; omit to infer from git remote',
    )
    .argument(
      '[localId]',
      'merge request local ID; with two args this is the second (repo first)',
    )
    .option('--remote <name>', 'git remote when repo is omitted', 'origin')
    .option('--json', 'print raw JSON response')
    .action(async (repoArg, localId, opts) => {
      const { repoArg: repoRefArg, localId: mrLocalId } = normalizeMrRepoAndLocalId(
        repoArg,
        localId,
      );

      const cfg = loadConfig();
      const repoRef = await resolveMrRepoRef(repoRefArg, opts, cfg);

      const { data: closeResult } = await api.closeChangeRequest(
        repoRef,
        mrLocalId,
        cfg,
      );

      const { data } = await api.getChangeRequest(repoRef, mrLocalId, cfg);

      if (opts.json) {
        printJson({ result: closeResult, changeRequest: data });
        return;
      }

      printSection('Merge request closed');
      printKeyValue(pickChangeRequestSummary(data));
    });
}
