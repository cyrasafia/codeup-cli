import { api } from '../client.js';
import {
  pickChangeRequestSummary,
  printJson,
  printKeyValue,
  printSection,
} from '../format.js';

export function registerGetMrCommand(program) {
  program
    .command('get-mr')
    .description('Show merge request details by repository and local ID')
    .argument('<repoId>', 'numeric repository ID or "namespace/path"')
    .argument('<localId>', 'merge request local ID within the repository')
    .option('--json', 'print raw JSON response')
    .action(async (repoId, localId, opts) => {
      const { data } = await api.getChangeRequest(repoId, localId);

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
