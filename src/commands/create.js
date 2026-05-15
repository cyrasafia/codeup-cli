import { api } from '../client.js';
import { printJson, printKeyValue, printSection } from '../format.js';

const VALID_VISIBILITY = new Set(['private', 'internal']);
/** API: EMPTY = 仍会自动创建空的 README.md；USER_GUIDE = 带引导内容。不传字段则不请求平台自动建 README。 */
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
      'private | internal (default: internal)',
      'internal',
    )
    .option('--namespace-id <id>', 'parent namespace ID; omit to create at org root')
    .option(
      '--readme <type>',
      'omit (default): do not send readMeType; EMPTY: empty README.md; USER_GUIDE: onboarding README',
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
      if (opts.readme !== undefined && !VALID_README.has(opts.readme)) {
        throw new Error(
          `--readme must be one of: ${[...VALID_README].join(', ')}`,
        );
      }

      const body = {
        name,
        path: opts.path || name,
        visibility: opts.visibility,
      };
      if (opts.readme !== undefined) {
        body.readMeType = opts.readme;
      }
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
