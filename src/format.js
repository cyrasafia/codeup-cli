function visibleLength(str) {
  return [...String(str ?? '')].length;
}

function padCell(value, width) {
  const s = String(value ?? '');
  const pad = width - visibleLength(s);
  return pad > 0 ? s + ' '.repeat(pad) : s;
}

export function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function printTable(rows, columns) {
  if (!rows || rows.length === 0) {
    process.stdout.write('(no items)\n');
    return;
  }
  const widths = columns.map((col) => {
    const headerLen = visibleLength(col.header);
    const cellMax = rows.reduce((acc, row) => {
      const v = col.value ? col.value(row) : row[col.key];
      return Math.max(acc, visibleLength(v));
    }, 0);
    return Math.max(headerLen, cellMax);
  });

  const headerLine = columns
    .map((col, i) => padCell(col.header, widths[i]))
    .join('  ');
  const sepLine = widths.map((w) => '-'.repeat(w)).join('  ');
  process.stdout.write(`${headerLine}\n${sepLine}\n`);

  for (const row of rows) {
    const line = columns
      .map((col, i) => {
        const v = col.value ? col.value(row) : row[col.key];
        return padCell(v, widths[i]);
      })
      .join('  ');
    process.stdout.write(`${line}\n`);
  }
}

export function printKeyValue(pairs, { indent = 0 } = {}) {
  const prefix = ' '.repeat(indent);
  const keyWidth = pairs.reduce(
    (acc, [k]) => Math.max(acc, visibleLength(k)),
    0,
  );
  for (const [k, v] of pairs) {
    if (v === undefined || v === null || v === '') continue;
    process.stdout.write(
      `${prefix}${padCell(k, keyWidth)}  ${formatValue(v)}\n`,
    );
  }
}

function formatValue(v) {
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export function printSection(title) {
  process.stdout.write(`\n${title}\n${'-'.repeat(visibleLength(title))}\n`);
}

export function pickRepoSummary(repo) {
  return [
    ['ID', repo.id],
    ['Name', repo.name],
    ['Path', repo.pathWithNamespace || repo.path],
    ['Visibility', repo.visibility],
    ['Default branch', repo.defaultBranch],
    ['Description', repo.description],
    ['Archived', repo.archived],
    ['Created at', repo.createdAt],
    ['Last activity', repo.lastActivityAt],
    ['Web URL', repo.webUrl],
    ['HTTP clone', repo.httpUrlToRepo],
    ['SSH clone', repo.sshUrlToRepo],
  ];
}

export function pickChangeRequestSummary(cr) {
  const status = cr.status || cr.state;
  const authorName = cr.author ? cr.author.name || cr.author.username : undefined;
  return [
    ['Local ID', cr.localId],
    ['Title', cr.title],
    ['Status', status],
    ['Source', cr.sourceBranch],
    ['Target', cr.targetBranch],
    ['Author', authorName],
    ['Conflict', cr.conflictCheckStatus || (cr.hasConflict != null ? cr.hasConflict : undefined)],
    ['Created at', cr.createTime || cr.createdAt],
    ['Updated at', cr.updateTime || cr.updatedAt],
    ['Detail URL', cr.detailUrl],
    ['Web URL', cr.webUrl],
  ];
}
