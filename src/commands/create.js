import { api } from '../client.js';
import { printJson, printKeyValue, printSection } from '../format.js';

const VALID_VISIBILITY = new Set(['private', 'internal']);
const VALID_README = new Set(['EMPTY', 'USER_GUIDE']);

function parseIntOption(value, name) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid integer for ${name}: ${value}`);
  }
  return n;
}

export function registerCreateCommand(program) {
  program
    .command('create')
    .description('Create a new repository')
    .argument('<name>', 'repository name (also used as path unless --path is set)')
    .option('--path <path>', 'repository path (defaults to <name>)')
    .option('-d, --description <text>', 'repository description')
    .option(
      '--visibility <v>',
      'private | internal (default: private)',
      'private',
    )
    .option('--namespace-id <id>', 'parent namespace ID; omit to create at org root')
    .option(
      '--readme <type>',
      'EMPTY | USER_GUIDE (default: USER_GUIDE)',
      'USER_GUIDE',
    )
    .option('--avatar-url <url>', 'avatar URL')
    .option('--create-parent-path', 'auto-create the parent path if missing')
    .option('--json', 'print raw JSON response')
    .action(async (name, opts) => {
      if (!VALID_VISIBILITY.has(opts.visibility)) {
        throw new Error(
          `--visibility must be one of: ${[...VALID_VISIBILITY].join(', ')}`,
        );
      }
      if (!VALID_README.has(opts.readme)) {
        throw new Error(
          `--readme must be one of: ${[...VALID_README].join(', ')}`,
        );
      }

      const body = {
        name,
        path: opts.path || name,
        visibility: opts.visibility,
        readMeType: opts.readme,
      };
      if (opts.description) body.description = opts.description;
      if (opts.avatarUrl) body.avatarUrl = opts.avatarUrl;
      if (opts.namespaceId) {
        body.namespaceId = parseIntOption(opts.namespaceId, '--namespace-id');
      }

      const query = {};
      if (opts.createParentPath) query.createParentPath = true;

      const { data } = await api.createRepository(body, query);

      if (opts.json) {
        printJson(data);
        return;
      }

      printSection('Repository created');
      printKeyValue([
        ['ID', data.id],
        ['Name', data.name],
        ['Path', data.pathWithNamespace || data.path],
        ['Visibility', data.visibility],
        ['Web URL', data.webUrl],
        ['HTTP clone', data.httpUrlToRepo],
        ['SSH clone', data.sshUrlToRepo],
      ]);
    });
}
