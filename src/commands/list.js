import { api } from '../client.js';
import { printJson, printTable } from '../format.js';

function parsePositiveInt(value, name) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid value for ${name}: ${value}`);
  }
  return n;
}

export function registerListCommand(program) {
  program
    .command('list')
    .description('List repositories in the organization')
    .option('-p, --page <n>', 'page number (default: 1)')
    .option('-s, --per-page <n>', 'items per page, 1-100 (default: 20)')
    .option(
      '--order-by <field>',
      'sort field: created_at | name | path | last_activity_at',
    )
    .option('--sort <dir>', 'sort direction: asc | desc')
    .option('--search <kw>', 'fuzzy match repository path')
    .option('--archived', 'only show archived repositories')
    .option('--all', 'auto-paginate and return every repository')
    .option('--json', 'print raw JSON response')
    .action(async (opts) => {
      if (opts.all && (opts.page || opts.perPage)) {
        // Allow --all with --per-page to control batch size, but ignore --page
      }

      const baseQuery = {
        orderBy: opts.orderBy,
        sort: opts.sort,
        search: opts.search,
        archived: opts.archived ? true : undefined,
        perPage: opts.perPage
          ? parsePositiveInt(opts.perPage, '--per-page')
          : undefined,
      };

      let items = [];
      let lastHeaders = {};

      if (opts.all) {
        const perPage = baseQuery.perPage || 100;
        let page = 1;
        // Cap to API documented soft limit of 150 pages.
        for (; page <= 150; page += 1) {
          const { data, headers } = await api.listRepositories({
            ...baseQuery,
            perPage,
            page,
          });
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
        const { data, headers } = await api.listRepositories({
          ...baseQuery,
          page,
        });
        lastHeaders = headers;
        items = Array.isArray(data) ? data : [];
      }

      if (opts.json) {
        printJson(items);
        return;
      }

      printTable(items, [
        { header: 'ID', value: (r) => r.id },
        { header: 'Path', value: (r) => r.pathWithNamespace || r.path },
        { header: 'Name', value: (r) => r.name },
        { header: 'Visibility', value: (r) => r.visibility },
        { header: 'Last activity', value: (r) => r.lastActivityAt || '' },
        { header: 'Web URL', value: (r) => r.webUrl || '' },
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
