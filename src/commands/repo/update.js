import { api } from '../../client.js';
import {
  pickRepoSummary,
  printJson,
  printKeyValue,
  printSection,
} from '../../format.js';

const VALID_VISIBILITY = new Set(['private', 'internal']);

export function registerRepoUpdateCommand(program) {
  program
    .command('update')
    .description('Update repository fields (at least one --field is required)')
    .argument('<repoId>', 'numeric repository ID or "namespace/path"')
    .option('--name <name>', 'new repository name')
    .option('--path <path>', 'new repository path')
    .option('-d, --description <text>', 'new description')
    .option('--visibility <v>', 'private | internal')
    .option('--default-branch <branch>', 'new default branch')
    .option('--json', 'print raw JSON response')
    .action(async (repoId, opts) => {
      const body = {};
      if (opts.name !== undefined) body.name = opts.name;
      if (opts.path !== undefined) body.path = opts.path;
      if (opts.description !== undefined) body.description = opts.description;
      if (opts.visibility !== undefined) {
        if (!VALID_VISIBILITY.has(opts.visibility)) {
          throw new Error(
            `--visibility must be one of: ${[...VALID_VISIBILITY].join(', ')}`,
          );
        }
        body.visibility = opts.visibility;
      }
      if (opts.defaultBranch !== undefined) {
        body.default_branch = opts.defaultBranch;
      }

      if (Object.keys(body).length === 0) {
        throw new Error(
          'No update fields provided. Use at least one of: --name, --path, --description, --visibility, --default-branch.',
        );
      }

      const { data } = await api.updateRepository(repoId, body);

      if (opts.json) {
        printJson(data);
        return;
      }

      printSection('Repository updated');
      printKeyValue(pickRepoSummary(data));
    });
}
