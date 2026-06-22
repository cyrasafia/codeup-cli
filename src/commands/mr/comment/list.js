import { api } from '../../../client.js';
import { loadConfig } from '../../../config.js';
import { printCommentTree, printJson, printSection } from '../../../format.js';
import {
  resolveMrRepoRef,
  normalizeMrRepoAndLocalId,
} from '../../shared/mr-repo-resolve.js';
import { buildListCommentsBody } from './helpers.js';

const VALID_TYPES = new Set(['all', 'global', 'inline']);

export function registerMrCommentListCommand(program) {
  program
    .command('list')
    .description('List merge request comments')
    .argument(
      '[repoId]',
      'numeric repository ID or namespace/path; omit to infer from git remote',
    )
    .argument(
      '[localId]',
      'merge request local ID; with two args this is the second (repo first)',
    )
    .option('--resolved', 'only resolved comments')
    .option('--unresolved', 'only unresolved comments')
    .option('--type <t>', 'comment type: all | global | inline (default: all)', 'all')
    .option('--file <path>', 'filter inline comments by file path')
    .option('--include-drafts', 'include draft comments')
    .option('--remote <name>', 'git remote when repo is omitted', 'origin')
    .option('--json', 'print raw JSON response')
    .action(async (repoArg, localId, opts) => {
      if (opts.resolved && opts.unresolved) {
        throw new Error('Cannot use --resolved and --unresolved together.');
      }
      if (!VALID_TYPES.has(opts.type)) {
        throw new Error(
          `--type must be one of: ${[...VALID_TYPES].join(', ')}`,
        );
      }

      const { repoArg: repoRefArg, localId: mrLocalId } =
        normalizeMrRepoAndLocalId(repoArg, localId);

      const cfg = loadConfig();
      const repoRef = await resolveMrRepoRef(repoRefArg, opts, cfg);

      let resolvedFilter;
      if (opts.resolved) resolvedFilter = true;
      if (opts.unresolved) resolvedFilter = false;

      const body = buildListCommentsBody({
        type: opts.type,
        file: opts.file,
        resolved: resolvedFilter,
        includeDrafts: opts.includeDrafts,
      });

      const { data } = await api.listChangeRequestComments(
        repoRef,
        mrLocalId,
        body,
        cfg,
      );

      if (opts.json) {
        printJson(data);
        return;
      }

      const comments = Array.isArray(data) ? data : [];
      printSection(`Comments (MR #${mrLocalId})`);
      printCommentTree(comments);
    });
}
