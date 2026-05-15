import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CONFIG_DIR = path.join(os.homedir(), '.codeup');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const ENV_KEYS = {
  token: 'CODEUP_TOKEN',
  domain: 'CODEUP_DOMAIN',
  organizationId: 'CODEUP_ORG_ID',
};

export function getConfigPath() {
  return CONFIG_FILE;
}

export function readConfigFile() {
  if (!fs.existsSync(CONFIG_FILE)) return {};
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    throw new Error(
      `Failed to parse config file ${CONFIG_FILE}: ${err.message}`,
    );
  }
}

export function writeConfigFile(next) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(
    CONFIG_FILE,
    `${JSON.stringify(next, null, 2)}\n`,
    { mode: 0o600 },
  );
}

export function loadConfig() {
  const file = readConfigFile();
  const merged = {
    token: process.env[ENV_KEYS.token] || file.token || '',
    domain: process.env[ENV_KEYS.domain] || file.domain || '',
    organizationId:
      process.env[ENV_KEYS.organizationId] || file.organizationId || '',
    defaultNamespaceId:
      process.env.CODEUP_DEFAULT_NAMESPACE ||
      process.env.CODEUP_DEFAULT_NAMESPACE_ID ||
      file.defaultNamespaceId ||
      '',
  };
  return merged;
}

export function requireConfig(cfg = loadConfig()) {
  const missing = [];
  if (!cfg.token) missing.push('token (CODEUP_TOKEN)');
  if (!cfg.domain) missing.push('domain (CODEUP_DOMAIN)');
  if (!cfg.organizationId) missing.push('organizationId (CODEUP_ORG_ID)');
  if (missing.length) {
    throw new Error(
      `Missing required config: ${missing.join(', ')}. ` +
        `Set them via environment variables or "codeup config set <key> <value>".`,
    );
  }
  return cfg;
}

export function maskToken(token) {
  if (!token) return '';
  if (token.length <= 8) return '*'.repeat(token.length);
  return `${token.slice(0, 4)}${'*'.repeat(Math.max(token.length - 8, 4))}${token.slice(-4)}`;
}

export const CONFIG_KEY_ALIASES = {
  token: 'token',
  domain: 'domain',
  'org-id': 'organizationId',
  orgid: 'organizationId',
  organization: 'organizationId',
  organizationid: 'organizationId',
  'default-namespace-id': 'defaultNamespaceId',
  defaultnamespaceid: 'defaultNamespaceId',
  'default-ns-id': 'defaultNamespaceId',
  defaultnsid: 'defaultNamespaceId',
  'default-namespace': 'defaultNamespaceId',
  defaultnamespace: 'defaultNamespaceId',
  'default-namespace-path': 'defaultNamespaceId',
  defaultnamespacepath: 'defaultNamespaceId',
};

export function normalizeConfigKey(key) {
  const lower = String(key || '').toLowerCase();
  const normalized = CONFIG_KEY_ALIASES[lower];
  if (!normalized) {
    throw new Error(
      `Unknown config key "${key}". Valid keys: token, domain, org-id, default-namespace-id (or default-namespace / default-namespace-path).`,
    );
  }
  return normalized;
}
