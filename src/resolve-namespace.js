import { requireConfig } from './config.js';

function orgApiBase(cfg) {
  const proto = String(cfg.domain).startsWith('http') ? '' : 'https://';
  const base = `${proto}${cfg.domain}`.replace(/\/+$/, '');
  return `${base}/oapi/v1/codeup/organizations/${encodeURIComponent(cfg.organizationId)}`;
}

function isAllDigits(ref) {
  const s = String(ref).trim();
  return s !== '' && /^\d+$/.test(s);
}

/**
 * @param {string|number} ref namespace 数字 ID，或全路径（如 zlxt/zl-product）
 * @param {object} [cfg] merged config from loadConfig / requireConfig
 * @returns {Promise<number>}
 */
export async function resolveNamespaceRefToId(ref, cfg) {
  const cfgR = cfg || requireConfig();
  const trimmed = String(ref ?? '').trim().replace(/^\/+|\/+$/g, '');
  if (!trimmed) {
    throw new Error('namespace ref is empty');
  }
  if (isAllDigits(trimmed)) {
    return Number.parseInt(trimmed, 10);
  }

  const url = `${orgApiBase(cfgR)}/namespaces/${encodeURIComponent(trimmed)}`;
  const res = await fetch(url, {
    headers: {
      'x-yunxiao-token': cfgR.token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail =
      data && typeof data === 'object' ? JSON.stringify(data) : data || res.statusText;
    let hint = '';
    if (res.status === 403) {
      hint =
        '\nHint: resolving a path uses GET .../namespaces/{ref} (GetNamespace). ' +
        'Ensure your PAT has code-group (代码组) read access, or use a numeric namespace id instead.';
    }
    throw new Error(
      `Failed to resolve namespace "${trimmed}": HTTP ${res.status}\n${detail}${hint}`,
    );
  }
  if (!data || typeof data.id !== 'number') {
    throw new Error(
      `Unexpected namespace response for "${trimmed}": ${JSON.stringify(data)}`,
    );
  }
  return data.id;
}
