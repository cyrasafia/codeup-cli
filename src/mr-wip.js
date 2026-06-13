const WIP_PREFIX_RE = /^\[wip\]\s*/i;

export function applyWipTitle(title, wip) {
  const trimmed = String(title ?? '').trim();
  if (!wip) return trimmed;
  if (WIP_PREFIX_RE.test(trimmed)) return trimmed;
  return `[wip] ${trimmed}`;
}

export function stripWipTitle(title) {
  return String(title ?? '').replace(WIP_PREFIX_RE, '').trim();
}
