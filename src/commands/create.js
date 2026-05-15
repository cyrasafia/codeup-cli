import { api } from '../client.js';
import { loadConfig } from '../config.js';
import { printJson, printKeyValue, printSection } from '../format.js';
import { resolveNamespaceRefToId } from '../resolve-namespace.js';

const VALID_VISIBILITY = new Set(['private', 'internal']);
/** API: EMPTY = 仍会自动创建空的 README.md；USER_GUIDE = 带引导内容。不传字段则不请求平台自动建 README。 */
const VALID_README = new Set(['EMPTY', 'USER_GUIDE']);

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
    .option(
      '--namespace-id <ref>',
      'parent namespace: numeric id or full path (e.g. zlxt/zl-product); omit uses config default',
    )
    .option(
      '--org-root',
      'with no --namespace-id: create under org root instead of defaultNamespaceId',
    )
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

      const cfg = loadConfig();
      if (opts.namespaceId !== undefined && opts.namespaceId !== null) {
        const rawNs = String(opts.namespaceId).trim();
        if (rawNs !== '') {
          body.namespaceId = await resolveNamespaceRefToId(rawNs, cfg);
        }
      } else if (!opts.orgRoot && cfg.defaultNamespaceId) {
        const raw = String(cfg.defaultNamespaceId).trim();
        if (raw !== '') {
          body.namespaceId = await resolveNamespaceRefToId(raw, cfg);
        }
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
