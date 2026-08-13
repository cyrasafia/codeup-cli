import { requireConfig } from './config.js';

function buildOrgUrl(cfg, segments, query) {
  const proto = cfg.domain.startsWith('http') ? '' : 'https://';
  const base = `${proto}${cfg.domain}`.replace(/\/+$/, '');
  const path = segments.replace(/^\/+/, '');
  const url = new URL(
    `${base}/oapi/v1/codeup/organizations/${encodeURIComponent(
      cfg.organizationId,
    )}/${path}`,
  );
  if (query && typeof query === 'object') {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function buildUrl(cfg, suffix, query) {
  return buildOrgUrl(cfg, `repositories${suffix}`, query);
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
  return requestUrl(method, url, { body, cfg });
}

export async function requestOrg(method, segments, options = {}) {
  const { query, body, cfg: providedCfg } = options;
  const cfg = providedCfg || requireConfig();
  const url = buildOrgUrl(cfg, segments, query);
  return requestUrl(method, url, { body, cfg });
}

async function requestUrl(method, url, options = {}) {
  const { body, cfg } = options;
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
  createChangeRequest(repoId, body, cfg) {
    return request(
      'POST',
      `/${encodeRepoId(repoId)}/changeRequests`,
      { body, cfg },
    );
  },
  listChangeRequests(query, cfg) {
    return requestOrg('GET', 'changeRequests', { query, cfg });
  },
  getChangeRequest(repoId, localId, cfg) {
    return request(
      'GET',
      `/${encodeRepoId(repoId)}/changeRequests/${encodeURIComponent(String(localId))}`,
      { cfg },
    );
  },
  updateChangeRequest(repoId, localId, body, cfg) {
    return request(
      'PUT',
      `/${encodeRepoId(repoId)}/changeRequests/${encodeURIComponent(String(localId))}`,
      { body, cfg },
    );
  },
  reviewChangeRequest(repoId, localId, body, cfg) {
    return request(
      'POST',
      `/${encodeRepoId(repoId)}/changeRequests/${encodeURIComponent(String(localId))}/review`,
      { body, cfg },
    );
  },
  mergeChangeRequest(repoId, localId, body, cfg) {
    return request(
      'POST',
      `/${encodeRepoId(repoId)}/changeRequests/${encodeURIComponent(String(localId))}/merge`,
      { body, cfg },
    );
  },
  closeChangeRequest(repoId, localId, cfg) {
    return request(
      'POST',
      `/${encodeRepoId(repoId)}/changeRequests/${encodeURIComponent(String(localId))}/close`,
      { cfg },
    );
  },
  listChangeRequestComments(repoId, localId, body, cfg) {
    return request(
      'POST',
      `/${encodeRepoId(repoId)}/changeRequests/${encodeURIComponent(String(localId))}/comments/list`,
      { body, cfg },
    );
  },
  createChangeRequestComment(repoId, localId, body, cfg) {
    return request(
      'POST',
      `/${encodeRepoId(repoId)}/changeRequests/${encodeURIComponent(String(localId))}/comments`,
      { body, cfg },
    );
  },
  updateChangeRequestComment(repoId, localId, commentBizId, body, cfg) {
    return request(
      'PUT',
      `/${encodeRepoId(repoId)}/changeRequests/${encodeURIComponent(String(localId))}/comments/${encodeURIComponent(String(commentBizId))}`,
      { body, cfg },
    );
  },
  listChangeRequestPatchSets(repoId, localId, cfg) {
    return request(
      'GET',
      `/${encodeRepoId(repoId)}/changeRequests/${encodeURIComponent(String(localId))}/diffs/patches`,
      { cfg },
    );
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

function isNumericRepoRef(ref) {
  return /^\d+$/.test(String(ref).trim());
}

export async function resolveRepoRefToId(ref, cfg) {
  const trimmed = String(ref).trim();
  if (!trimmed) {
    throw new Error('repoId is required');
  }
  if (isNumericRepoRef(trimmed)) {
    return Number.parseInt(trimmed, 10);
  }
  const { data } = await api.getRepository(trimmed, cfg);
  if (!data || data.id === undefined || data.id === null) {
    throw new Error(`Could not resolve repository ID for: ${trimmed}`);
  }
  return data.id;
}
