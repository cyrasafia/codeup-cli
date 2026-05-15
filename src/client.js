import { requireConfig } from './config.js';

function buildUrl(cfg, suffix, query) {
  const proto = cfg.domain.startsWith('http') ? '' : 'https://';
  const base = `${proto}${cfg.domain}`.replace(/\/+$/, '');
  const url = new URL(
    `${base}/oapi/v1/codeup/organizations/${encodeURIComponent(
      cfg.organizationId,
    )}/repositories${suffix}`,
  );
  if (query && typeof query === 'object') {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function headersToObject(headers) {
  const out = {};
  for (const [k, v] of headers.entries()) out[k] = v;
  return out;
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request(method, suffix, options = {}) {
  const { query, body, cfg: providedCfg } = options;
  const cfg = providedCfg || requireConfig();
  const url = buildUrl(cfg, suffix, query);
  const init = {
    method,
    headers: {
      'x-yunxiao-token': cfg.token,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    throw new Error(`Network error calling ${method} ${url}: ${err.message}`);
  }

  const data = await parseBody(res);

  if (!res.ok) {
    const detail =
      data && typeof data === 'object'
        ? JSON.stringify(data)
        : data || res.statusText;
    throw new Error(`HTTP ${res.status} ${method} ${url}\n${detail}`);
  }

  return { data, headers: headersToObject(res.headers), status: res.status };
}

export const api = {
  listRepositories(query, cfg) {
    return request('GET', '', { query, cfg });
  },
  getRepository(repoId, cfg) {
    return request('GET', `/${encodeRepoId(repoId)}`, { cfg });
  },
  createRepository(body, query, cfg) {
    return request('POST', '', { body, query, cfg });
  },
  updateRepository(repoId, body, cfg) {
    return request('PUT', `/${encodeRepoId(repoId)}`, { body, cfg });
  },
};

export function encodeRepoId(repoId) {
  if (repoId === undefined || repoId === null || repoId === '') {
    throw new Error('repoId is required');
  }
  const s = String(repoId);
  if (s.includes('/')) return encodeURIComponent(s);
  return encodeURIComponent(s);
}
