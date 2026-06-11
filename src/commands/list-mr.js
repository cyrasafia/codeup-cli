import { api, resolveRepoRefToId } from '../client.js';
import { loadConfig } from '../config.js';
import { printJson, printTable } from '../format.js';
import { readGitContext } from '../git-context.js';

const VALID_STATE = new Set(['opened', 'merged', 'closed']);
const VALID_ORDER_BY = new Set(['created_at', 'updated_at']);
const VALID_SORT = new Set(['asc', 'desc']);

function parsePositiveInt(value, name) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid value for ${name}: ${value}`);
  }
  return n;
}

async function resolveProjectIds(repoArg, opts, cfg) {
  if (repoArg) {
    const id = await resolveRepoRefToId(repoArg, cfg);
    return String(id);
  }
  const gitCtx = readGitContext({ remoteName: opts.remote || 'origin' });
  const id = await resolveRepoRefToId(gitCtx.repoPath, cfg);
  return String(id);
}

export function registerListMrCommand(program) {
  program
    .command('list-mr')
    .description('List merge requests (change requests)')
    .argument(
      '[repoId]',
      'numeric repository ID or namespace/path; omit to infer from git remote',
    )
    .option('-p, --page <n>', 'page number (default: 1)')
    .option('-s, --per-page <n>', 'items per page, 1-100 (default: 20)')
    .option('--state <s>', 'filter: opened | merged | closed')
    .option('--search <kw>', 'title keyword search')
    .option('--order-by <field>', 'created_at | updated_at')
    .option('--sort <dir>', 'asc | desc')
    .option('--remote <name>', 'git remote when repo is omitted', 'origin')
    .option('--all', 'auto-paginate and return every merge request')
    .option('--json', 'print raw JSON response')
    .action(async (repoArg, opts) => {
      if (opts.state && !VALID_STATE.has(opts.state)) {
        throw new Error(
          `--state must be one of: ${[...VALID_STATE].join(', ')}`,
        );
      }
      if (opts.orderBy && !VALID_ORDER_BY.has(opts.orderBy)) {
        throw new Error(
          `--order-by must be one of: ${[...VALID_ORDER_BY].join(', ')}`,
        );
      }
      if (opts.sort && !VALID_SORT.has(opts.sort)) {
        throw new Error(`--sort must be one of: ${[...VALID_SORT].join(', ')}`);
      }

      const cfg = loadConfig();
      const projectIds = await resolveProjectIds(repoArg, opts, cfg);

      const baseQuery = {
        projectIds,
        state: opts.state,
        search: opts.search,
        orderBy: opts.orderBy,
        sort: opts.sort,
        perPage: opts.perPage
          ? parsePositiveInt(opts.perPage, '--per-page')
          : undefined,
      };

      let items = [];
      let lastHeaders = {};

      if (opts.all) {
        const perPage = baseQuery.perPage || 100;
        let page = 1;
        for (; page <= 150; page += 1) {
          const { data, headers } = await api.listChangeRequests(
            { ...baseQuery, perPage, page },
            cfg,
          );
          lastHeaders = headers;
          if (Array.isArray(data) && data.length > 0) items = items.concat(data);
          const totalPages = Number.parseInt(headers['x-total-pages'] || '0', 10);
          const nextPage = headers['x-next-page'];
          if (!nextPage || nextPage === '' || nextPage === '0') break;
          if (totalPages && page >= totalPages) break;
          if (Array.isArray(data) && data.length < perPage) break;
        }
      } else {
        const page = opts.page ? parsePositiveInt(opts.page, '--page') : undefined;
        const { data, headers } = await api.listChangeRequests(
          { ...baseQuery, page },
          cfg,
        );
        lastHeaders = headers;
        items = Array.isArray(data) ? data : [];
      }

      if (opts.json) {
        printJson(items);
        return;
      }

      printTable(items, [
        { header: 'ID', value: (r) => r.localId },
        { header: 'Title', value: (r) => r.title },
        { header: 'Status', value: (r) => r.status || r.state || '' },
        { header: 'Source', value: (r) => r.sourceBranch || '' },
        { header: 'Target', value: (r) => r.targetBranch || '' },
        {
          header: 'Author',
          value: (r) => (r.author ? r.author.name || r.author.username : ''),
        },
        { header: 'Updated', value: (r) => r.updatedAt || r.updateTime || '' },
        { header: 'Web URL', value: (r) => r.webUrl || r.detailUrl || '' },
      ]);

      const total = lastHeaders['x-total'];
      const page = lastHeaders['x-page'];
      const totalPages = lastHeaders['x-total-pages'];
      if (total || page) {
        const summary = [
          items.length ? `shown ${items.length}` : null,
          total ? `total ${total}` : null,
          page && totalPages ? `page ${page}/${totalPages}` : null,
        ]
          .filter(Boolean)
          .join('  |  ');
        if (summary) process.stdout.write(`\n${summary}\n`);
      }
    });
}
