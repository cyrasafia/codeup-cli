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

function summarizeCommentContent(content, maxLen = 80) {
  const text = String(content ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1)}…`;
}

function formatCommentLocation(comment) {
  const filePath = comment.filePath || comment.file_path;
  if (!filePath) return '';
  const line = comment.line_number != null ? `:${comment.line_number}` : '';
  return `${filePath}${line}`;
}

function formatCommentAuthor(comment) {
  const author = comment.author;
  if (!author) return '';
  return author.name || author.username || author.userId || '';
}

function printCommentContent(indent, content, full) {
  if (full) {
    for (const line of String(content).replace(/\n$/, '').split('\n')) {
      process.stdout.write(`${indent}  ${line}\n`);
    }
  } else {
    process.stdout.write(`${indent}  ${summarizeCommentContent(content)}\n`);
  }
}

function printCommentNode(comment, depth = 0, { full = false } = {}) {
  const indent = '  '.repeat(depth);
  const author = formatCommentAuthor(comment);
  const type = (comment.comment_type || '').replace('_COMMENT', '').toLowerCase();
  const resolved = comment.resolved ? 'resolved' : 'open';
  const location = formatCommentLocation(comment);
  const locationPart = location ? ` @ ${location}` : '';
  const header = `${indent}[${comment.comment_biz_id}] ${author} (${type}, ${resolved})${locationPart}`;
  process.stdout.write(`${header}\n`);
  if (comment.content) {
    printCommentContent(indent, comment.content, full);
  }
  const children = comment.child_comments_list;
  if (children && children.length > 0) {
    for (const child of children) {
      printCommentNode(child, depth + 1, { full });
    }
  }
}

export function printCommentTree(comments, { full = false } = {}) {
  if (!comments || comments.length === 0) {
    process.stdout.write('(no comments)\n');
    return;
  }
  for (const comment of comments) {
    printCommentNode(comment, 0, { full });
  }
}

export function pickCommentSummary(comment) {
  return [
    ['Comment ID', comment.comment_biz_id],
    ['Type', comment.comment_type],
    ['Author', formatCommentAuthor(comment)],
    ['Resolved', comment.resolved],
    ['State', comment.state],
    ['Location', formatCommentLocation(comment) || undefined],
    ['Content', comment.content],
    ['Parent', comment.parent_comment_biz_id],
    ['Root', comment.root_comment_biz_id],
    ['Created at', comment.comment_time],
  ];
}
