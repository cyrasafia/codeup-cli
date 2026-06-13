import { api } from '../../client.js';
import { loadConfig } from '../../config.js';
import { printJson, printKeyValue, printSection } from '../../format.js';
import { resolveMrRepoRef } from '../shared/mr-repo-resolve.js';

export function registerMrReviewCommand(program) {
  program
    .command('review')
    .description('Review a merge request (approve or reject)')
    .argument(
      '[repoId]',
      'numeric repository ID or namespace/path; omit to infer from git remote',
    )
    .argument('<localId>', 'merge request local ID within the repository')
    .option('--approve', 'approve the merge request (PASS)')
    .option('--reject', 'reject the merge request (NOT_PASS)')
    .option('-c, --comment <text>', 'review comment')
    .option(
      '--draft-comment-id <id>',
      'draft comment ID to submit with the review (repeatable)',
      (value, previous) => {
        const list = previous || [];
        list.push(value);
        return list;
      },
      [],
    )
    .option('--remote <name>', 'git remote when repo is omitted', 'origin')
    .option('--json', 'print raw JSON response')
    .action(async (repoArg, localId, opts) => {
      if (opts.approve && opts.reject) {
        throw new Error('Cannot use --approve and --reject together.');
      }
      if (!opts.approve && !opts.reject) {
        throw new Error('Review opinion is required. Use --approve or --reject.');
      }

      const cfg = loadConfig();
      const repoRef = await resolveMrRepoRef(repoArg, opts, cfg);

      const body = {
        reviewOpinion: opts.approve ? 'PASS' : 'NOT_PASS',
      };
      if (opts.comment) body.reviewComment = opts.comment;
      if (opts.draftCommentId && opts.draftCommentId.length > 0) {
        body.submitDraftCommentIds = opts.draftCommentId;
      }

      const { data } = await api.reviewChangeRequest(
        repoRef,
        localId,
        body,
        cfg,
      );

      if (opts.json) {
        printJson(data);
        return;
      }

      printSection('Merge request reviewed');
      printKeyValue([
        ['Result', data.result],
        ['Opinion', body.reviewOpinion],
        ['Repository', repoRef],
        ['Local ID', localId],
      ]);
    });
}
