import { resolveRepoRefToId } from '../../client.js';
import { readGitContext } from '../../git-context.js';

export function resolveMrRepoAndGit(repoArg, opts) {
  if (repoArg) {
    let gitCtx = null;
    if (!opts.sourceBranch) {
      try {
        gitCtx = readGitContext({ remoteName: opts.remote || 'origin' });
      } catch {
        gitCtx = null;
      }
    }
    return { repoRef: repoArg, gitCtx };
  }
  const gitCtx = readGitContext({ remoteName: opts.remote || 'origin' });
  return { repoRef: gitCtx.repoPath, gitCtx };
}

export async function resolveMrRepoRef(repoArg, { remote = 'origin' } = {}, cfg) {
  if (repoArg) {
    return repoArg;
  }
  const gitCtx = readGitContext({ remoteName: remote });
  return gitCtx.repoPath;
}

export async function resolveMrProjectIds(repoArg, opts, cfg) {
  const repoRef = await resolveMrRepoRef(repoArg, opts, cfg);
  const id = await resolveRepoRefToId(repoRef, cfg);
  return String(id);
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
