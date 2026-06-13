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

export function parseCodeupRemoteUrl(url) {
  const raw = String(url).trim();
  if (!raw) {
    throw new Error('remote URL is empty');
  }

  // SSH: git@codeup.aliyun.com:namespace/path/repo.git
  const sshMatch = raw.match(
    /^git@(?:codeup\.aliyun\.com|[\w.-]+):(.+?)(?:\.git)?$/,
  );
  if (sshMatch) {
    return sshMatch[1].replace(/\.git$/, '');
  }

  // HTTPS: https://codeup.aliyun.com/namespace/path/repo.git
  try {
    const parsed = new URL(raw);
    const path = parsed.pathname.replace(/^\/+/, '').replace(/\.git$/, '');
    if (path) return path;
  } catch {
    // fall through
  }

  throw new Error(
    `Could not parse Codeup remote URL: ${raw}\n` +
      'Expected SSH (git@codeup.aliyun.com:namespace/repo.git) or HTTPS Codeup URL.\n' +
      'Pass the repository explicitly: codeup mr create <namespace/path>',
  );
}

export function readGitContext({ cwd = process.cwd(), remoteName = 'origin' } = {}) {
  const inside = runGit(['rev-parse', '--is-inside-work-tree'], { cwd });
  if (inside !== 'true') {
    throw new Error(
      'Not inside a git repository. Pass the repository explicitly: codeup mr create <namespace/path>',
    );
  }

  let remoteUrl;
  try {
    remoteUrl = runGit(['remote', 'get-url', remoteName], { cwd });
  } catch {
    throw new Error(
      `Git remote "${remoteName}" not found. Use --remote <name> or pass the repository explicitly.`,
    );
  }

  const repoPath = parseCodeupRemoteUrl(remoteUrl);
  const currentBranch = runGit(['branch', '--show-current'], { cwd });
  if (!currentBranch) {
    throw new Error(
      'Could not determine current branch (detached HEAD?). Use --source-branch.',
    );
  }

  return { repoPath, currentBranch, remoteName, remoteUrl };
}

export function readLastCommitSubject({ cwd = process.cwd() } = {}) {
  try {
    return runGit(['log', '-1', '--pretty=%s'], { cwd });
  } catch {
    return '';
  }
}
