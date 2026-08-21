import { api } from '../../client.js';
import { loadConfig } from '../../config.js';
import {
  pickChangeRequestSummary,
  printJson,
  printKeyValue,
  printSection,
} from '../../format.js';
import { readLastCommitSubject } from '../../git-context.js';
import { applyWipTitle } from '../../mr-wip.js';
import { resolveMrRepoAndGit, fetchMrRepo } from '../shared/mr-repo-resolve.js';

export function registerMrCreateCommand(program) {
  program
    .command('create')
    .description('Create a merge request (change request)')
    .argument(
      '[repoId]',
      'numeric repository ID or namespace/path; omit to infer from git remote',
    )
    .option('-t, --title <text>', 'merge request title')
    .option('-d, --description <text>', 'merge request description')
    .option('--source-branch <name>', 'source branch (default: current git branch)')
    .option(
      '--target-branch <name>',
      'target branch (default: repository default branch)',
    )
    .option('--remote <name>', 'git remote to read when repo is omitted', 'origin')
    .option(
      '--reviewer <userId>',
      'reviewer user ID (repeatable)',
      (value, previous) => {
        const list = previous || [];
        list.push(value);
        return list;
      },
      [],
    )
    .option('--ai-review', 'trigger AI review after creation')
    .option(
      '--wip',
      'mark as work-in-progress (prepends [wip] to title; reviewers are not notified)',
    )
    .option('--json', 'print raw JSON response')
    .action(async (repoArg, opts) => {
      const cfg = loadConfig();
      const { repoRef, gitCtx } = resolveMrRepoAndGit(repoArg, opts);

      const repo = await fetchMrRepo(repoRef, cfg, {
        explicit: Boolean(repoArg),
      });
      const repoId = repo.id;

      const sourceBranch =
        opts.sourceBranch || (gitCtx ? gitCtx.currentBranch : undefined);
      const targetBranch = opts.targetBranch || repo.defaultBranch;

      if (!sourceBranch) {
        throw new Error(
          'Source branch is required. Use --source-branch or run inside a git repository.',
        );
      }
      if (!targetBranch) {
        throw new Error(
          'Target branch is required. Use --target-branch or ensure the repository has a default branch.',
        );
      }
      if (sourceBranch === targetBranch) {
        throw new Error(
          `Source and target branch are the same (${sourceBranch}). Use --source-branch to specify a feature branch.`,
        );
      }
      if (
        !opts.sourceBranch &&
        gitCtx &&
        sourceBranch === repo.defaultBranch
      ) {
        throw new Error(
          `Current branch "${sourceBranch}" is the default branch. Checkout a feature branch or pass --source-branch.`,
        );
      }

      let title = opts.title;
      if (!title) {
        title = readLastCommitSubject();
      }
      if (!title) {
        title = `Merge ${sourceBranch} into ${targetBranch}`;
      }
      title = applyWipTitle(title, opts.wip);

      const body = {
        title,
        sourceBranch,
        targetBranch,
        sourceProjectId: repoId,
        targetProjectId: repoId,
      };
      if (opts.description) body.description = opts.description;
      if (opts.reviewer && opts.reviewer.length > 0) {
        body.reviewerUserIds = opts.reviewer;
      }
      if (opts.aiReview) body.triggerAIReviewRun = true;

      const { data } = await api.createChangeRequest(repoRef, body, cfg);

      if (opts.json) {
        printJson(data);
        return;
      }

      printSection('Merge request created');
      printKeyValue(pickChangeRequestSummary(data));
    });
}
