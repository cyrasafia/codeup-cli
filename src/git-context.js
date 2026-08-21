import { execFileSync } from 'node:child_process';

function runGit(args, { cwd = process.cwd() } = {}) {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (err) {
    const stderr = err.stderr ? String(err.stderr).trim() : '';
    const msg = stderr || err.message || 'git command failed';
    throw new Error(msg);
  }
}

const CODEUP_GIT_HOST = 'codeup.aliyun.com';

function isCodeupHost(host) {
  return String(host || '').trim().toLowerCase() === CODEUP_GIT_HOST;
}

export function parseCodeupRemoteUrl(url) {
  const raw = String(url).trim();
  if (!raw) {
    throw new Error('remote URL is empty');
  }

  let host = null;
  let path = null;

  // SSH: git@codeup.aliyun.com:namespace/path/repo.git
  const sshMatch = raw.match(/^git@([^:/]+):(.+)$/);
  if (sshMatch) {
    host = sshMatch[1];
    path = sshMatch[2];
  } else {
    // HTTPS: https://codeup.aliyun.com/namespace/path/repo.git
    try {
      const parsed = new URL(raw);
      host = parsed.hostname;
      path = parsed.pathname;
    } catch {
      host = null;
    }
  }

  if (host && !isCodeupHost(host)) {
    throw new Error(
      `Git remote is not a Codeup repository: ${raw}\n` +
        `Only "${CODEUP_GIT_HOST}" remotes can be inferred automatically.\n` +
        'Pass the repository explicitly: codeup mr <command> <namespace/path>',
    );
  }

  const repoPath = String(path || '')
    .replace(/^\/+/, '')
    .replace(/\.git$/, '');
  if (repoPath) {
    return repoPath;
  }

  throw new Error(
    `Could not parse Codeup remote URL: ${raw}\n` +
      'Expected SSH (git@codeup.aliyun.com:namespace/repo.git) or HTTPS Codeup URL.\n' +
      'Pass the repository explicitly: codeup mr <command> <namespace/path>',
  );
}

export function readCurrentBranch({ cwd = process.cwd() } = {}) {
  const branch = runGit(['branch', '--show-current'], { cwd });
  if (!branch) {
    throw new Error(
      'Could not determine current branch (detached HEAD?). Use --source-branch.',
    );
  }
  return branch;
}

export function readGitContext({ cwd = process.cwd(), remoteName = 'origin' } = {}) {
  let inside;
  try {
    inside = runGit(['rev-parse', '--is-inside-work-tree'], { cwd });
  } catch {
    throw new Error(
      'Current directory is not a git repository.\n' +
        'Run the command from a git repository, or pass the repository explicitly: ' +
        'codeup mr <command> <namespace/path>',
    );
  }
  if (inside !== 'true') {
    throw new Error(
      'Current directory is not inside a git work tree (bare repository?).\n' +
        'Run the command from a git repository, or pass the repository explicitly: ' +
        'codeup mr <command> <namespace/path>',
    );
  }

  let remoteUrl;
  try {
    remoteUrl = runGit(['remote', 'get-url', remoteName], { cwd });
  } catch {
    let available = [];
    try {
      available = runGit(['remote'], { cwd })
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    } catch {
      available = [];
    }
    const hint = available.length
      ? `Available remotes: ${available.join(', ')}. Use --remote <name>.`
      : 'This repository has no remotes configured (git remote add origin <url>).';
    throw new Error(
      `Git remote "${remoteName}" not found. ${hint}\n` +
        'Or pass the repository explicitly: codeup mr <command> <namespace/path>',
    );
  }

  const repoPath = parseCodeupRemoteUrl(remoteUrl);
  const currentBranch = readCurrentBranch({ cwd });

  return { repoPath, currentBranch, remoteName, remoteUrl };
}

export function readLastCommitSubject({ cwd = process.cwd() } = {}) {
  try {
    return runGit(['log', '-1', '--pretty=%s'], { cwd });
  } catch {
    return '';
  }
}
