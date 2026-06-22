import { api } from '../../client.js';
import { loadConfig } from '../../config.js';
import {
  pickChangeRequestSummary,
  printJson,
  printKeyValue,
  printSection,
} from '../../format.js';
import {
  resolveMrRepoRef,
  normalizeMrRepoAndLocalId,
} from '../shared/mr-repo-resolve.js';

export function registerMrGetCommand(program) {
  program
    .command('get')
    .description('Show merge request details by repository and local ID')
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
      const { repoArg: repoRefArg, localId: mrLocalId } =
        normalizeMrRepoAndLocalId(repoArg, localId);

      const cfg = loadConfig();
      const repoRef = await resolveMrRepoRef(repoRefArg, opts, cfg);

      const { data } = await api.getChangeRequest(repoRef, mrLocalId, cfg);

      if (opts.json) {
        printJson(data);
        return;
      }

      printSection('Merge request');
      printKeyValue(pickChangeRequestSummary(data));

      if (data.reviewers && data.reviewers.length > 0) {
        printSection('Reviewers');
        for (const reviewer of data.reviewers) {
          printKeyValue(
            [
              ['Name', reviewer.name || reviewer.username],
              ['User ID', reviewer.userId],
              ['Reviewed', reviewer.hasReviewed],
              ['Opinion', reviewer.reviewOpinionStatus],
            ],
            { indent: 2 },
          );
        }
      }
    });
}
