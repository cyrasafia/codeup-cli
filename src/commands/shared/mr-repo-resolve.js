import { api } from '../../client.js';
import { readGitContext, readCurrentBranch } from '../../git-context.js';

function isNumericRepoRef(ref) {
  return /^\d+$/.test(String(ref).trim());
}

function repoNotFoundError(repoRef, cfg, explicit) {
  const org =
    cfg && cfg.organizationId ? ` in organization "${cfg.organizationId}"` : '';
  const lines = [
    `Repository not found on Codeup${org}: ${repoRef} (HTTP 404)`,
    '- Check the repository path/ID and that it belongs to your organization.',
    '- Check your token has access to it (see "codeup config").',
  ];
  if (!explicit) {
    lines.push(
      '- Or pass the repository explicitly: codeup mr <command> <namespace/path>',
    );
  }
  const err = new Error(lines.join('\n'));
  err.status = 404;
  return err;
}

export async function fetchMrRepo(repoRef, cfg, { explicit = false } = {}) {
  let data;
  try {
    ({ data } = await api.getRepository(repoRef, cfg));
  } catch (err) {
    if (err && err.status === 404) {
      throw repoNotFoundError(repoRef, cfg, explicit);
    }
    throw err;
  }
  if (!data || data.id === undefined || data.id === null) {
    throw new Error(`Could not resolve repository: ${repoRef}`);
  }
  return data;
}

export function resolveMrRepoAndGit(repoArg, opts) {
  if (repoArg) {
    let gitCtx = null;
    if (!opts.sourceBranch) {
      try {
        gitCtx = readGitContext({ remoteName: opts.remote || 'origin' });
      } catch {
        // Remote may be missing or not Codeup; the current branch is still
        // local information, so fall back to reading it without the remote.
        try {
          gitCtx = { currentBranch: readCurrentBranch() };
        } catch {
          gitCtx = null;
        }
      }
    }
    return { repoRef: repoArg, gitCtx };
  }
  const gitCtx = readGitContext({ remoteName: opts.remote || 'origin' });
  return { repoRef: gitCtx.repoPath, gitCtx };
}

export async function resolveMrRepoRef(repoArg, { remote = 'origin' } = {}, cfg) {
  if (repoArg) {
    if (!isNumericRepoRef(repoArg)) {
      await fetchMrRepo(repoArg, cfg, { explicit: true });
    }
    return repoArg;
  }
  const gitCtx = readGitContext({ remoteName: remote });
  await fetchMrRepo(gitCtx.repoPath, cfg, { explicit: false });
  return gitCtx.repoPath;
}

export async function resolveMrProjectIds(repoArg, opts, cfg) {
  let repoRef = repoArg;
  let explicit = true;
  if (!repoRef) {
    repoRef = readGitContext({ remoteName: opts.remote || 'origin' }).repoPath;
    explicit = false;
  }
  if (isNumericRepoRef(repoRef)) {
    return String(Number.parseInt(repoRef.trim(), 10));
  }
  const repo = await fetchMrRepo(repoRef, cfg, { explicit });
  return String(repo.id);
}

/**
 * Commander maps a single positional arg to [repoId] when localId is optional
 * in the signature. Normalize so `mr merge 3` means localId=3 with repo from git.
 */
export function normalizeMrRepoAndLocalId(repoArg, localId) {
  if (localId !== undefined && localId !== null && String(localId).trim() !== '') {
    return {
      repoArg: repoArg === undefined ? undefined : String(repoArg).trim(),
      localId: String(localId).trim(),
    };
  }

  if (repoArg === undefined || repoArg === null || String(repoArg).trim() === '') {
    throw new Error(
      'localId is required. Usage: codeup mr <command> <localId> or codeup mr <command> <repoId> <localId>',
    );
  }

  const only = String(repoArg).trim();
  if (only.includes('/')) {
    throw new Error(
      'localId is required when repository is a path. Usage: codeup mr <command> <repoId> <localId>',
    );
  }

  return { repoArg: undefined, localId: only };
}
