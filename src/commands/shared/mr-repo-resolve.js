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
