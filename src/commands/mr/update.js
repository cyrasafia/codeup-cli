import { api } from '../../client.js';
import { loadConfig } from '../../config.js';
import {
  pickChangeRequestSummary,
  printJson,
  printKeyValue,
  printSection,
} from '../../format.js';
import { applyWipTitle, stripWipTitle } from '../../mr-wip.js';
import {
  resolveMrRepoRef,
  normalizeMrRepoAndLocalId,
} from '../shared/mr-repo-resolve.js';

function resolveTitle(opts, currentTitle) {
  if (opts.wip && opts.noWip) {
    throw new Error('Cannot use --wip and --no-wip together.');
  }

  if (opts.title !== undefined) {
    let title = String(opts.title).trim();
    if (opts.wip) title = applyWipTitle(title, true);
    if (opts.noWip) title = stripWipTitle(title);
    return title;
  }

  if (opts.wip) return applyWipTitle(currentTitle, true);
  if (opts.noWip) return stripWipTitle(currentTitle);

  return undefined;
}

export function registerMrUpdateCommand(program) {
  program
    .command('update')
    .description(
      'Update merge request title or description (at least one field is required)',
    )
    .argument(
      '[repoId]',
      'numeric repository ID or namespace/path; omit to infer from git remote',
    )
    .argument(
      '[localId]',
      'merge request local ID; with two args this is the second (repo first)',
    )
    .option('-t, --title <text>', 'new merge request title')
    .option('-d, --description <text>', 'new merge request description')
    .option(
      '--wip',
      'add [wip] prefix to title (uses current title if --title is omitted)',
    )
    .option(
      '--no-wip',
      'remove [wip] prefix from title (uses current title if --title is omitted)',
    )
    .option('--remote <name>', 'git remote when repo is omitted', 'origin')
    .option('--json', 'print raw JSON response')
    .action(async (repoArg, localId, opts) => {
      const { repoArg: repoRefArg, localId: mrLocalId } =
        normalizeMrRepoAndLocalId(repoArg, localId);

      const cfg = loadConfig();
      const repoRef = await resolveMrRepoRef(repoRefArg, opts, cfg);

      const hasDescription = opts.description !== undefined;
      const hasTitleChange =
        opts.title !== undefined || opts.wip || opts.noWip;

      if (!hasDescription && !hasTitleChange) {
        throw new Error(
          'No update fields provided. Use at least one of: --title, --description, --wip, --no-wip.',
        );
      }

      let currentTitle = '';
      if (hasTitleChange && opts.title === undefined && (opts.wip || opts.noWip)) {
        const { data } = await api.getChangeRequest(repoRef, mrLocalId, cfg);
        currentTitle = data.title ?? '';
      }

      const body = {};
      const title = resolveTitle(opts, currentTitle);
      if (title !== undefined) body.title = title;
      if (hasDescription) body.description = opts.description;

      const { data: updateResult } = await api.updateChangeRequest(
        repoRef,
        mrLocalId,
        body,
        cfg,
      );

      const { data } = await api.getChangeRequest(repoRef, mrLocalId, cfg);

      if (opts.json) {
        printJson({ result: updateResult, changeRequest: data });
        return;
      }

      printSection('Merge request updated');
      printKeyValue(pickChangeRequestSummary(data));
    });
}
