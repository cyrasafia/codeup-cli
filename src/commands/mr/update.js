import { api } from '../../client.js';
import {
  pickChangeRequestSummary,
  printJson,
  printKeyValue,
  printSection,
} from '../../format.js';
import { applyWipTitle, stripWipTitle } from '../../mr-wip.js';

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
    .argument('<repoId>', 'numeric repository ID or "namespace/path"')
    .argument('<localId>', 'merge request local ID within the repository')
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
    .option('--json', 'print raw JSON response')
    .action(async (repoId, localId, opts) => {
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
        const { data } = await api.getChangeRequest(repoId, localId);
        currentTitle = data.title ?? '';
      }

      const body = {};
      const title = resolveTitle(opts, currentTitle);
      if (title !== undefined) body.title = title;
      if (hasDescription) body.description = opts.description;

      const { data: updateResult } = await api.updateChangeRequest(
        repoId,
        localId,
        body,
      );

      const { data } = await api.getChangeRequest(repoId, localId);

      if (opts.json) {
        printJson({ result: updateResult, changeRequest: data });
        return;
      }

      printSection('Merge request updated');
      printKeyValue(pickChangeRequestSummary(data));
    });
}
