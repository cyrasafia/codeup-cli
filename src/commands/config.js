import {
  getConfigPath,
  loadConfig,
  maskToken,
  normalizeConfigKey,
  readConfigFile,
  writeConfigFile,
} from '../config.js';
import { printKeyValue, printSection } from '../format.js';

export function registerConfigCommand(program) {
  const cmd = program
    .command('config')
    .description('Manage CLI configuration (~/.codeup/config.json)');

  cmd
    .command('set')
    .description(
      'Set a config value (token | domain | org-id | default-namespace-id | …)',
    )
    .argument(
      '<key>',
      'config key: token | domain | org-id | default-namespace-id | default-namespace | default-namespace-path',
    )
    .argument(
      '<value>',
      'config value; for default-namespace-id: numeric id or path like zlxt/zl-product (empty clears)',
    )
    .action((key, value) => {
      const normalized = normalizeConfigKey(key);
      const current = readConfigFile();
      if (normalized === 'defaultNamespaceId' && value === '') {
        delete current.defaultNamespaceId;
        writeConfigFile(current);
        process.stdout.write(`Cleared ${normalized}\n`);
        process.stdout.write(`Config file: ${getConfigPath()}\n`);
        return;
      }
      current[normalized] = value;
      writeConfigFile(current);
      const display =
        normalized === 'token' ? maskToken(value) : value;
      process.stdout.write(`Saved ${normalized} = ${display}\n`);
      process.stdout.write(`Config file: ${getConfigPath()}\n`);
    });

  cmd
    .command('get')
    .description('Print current effective config (env > file)')
    .argument(
      '[key]',
      'optional key: token | domain | org-id | default-namespace-id',
    )
    .action((key) => {
      const cfg = loadConfig();
      if (key) {
        const normalized = normalizeConfigKey(key);
        const v = cfg[normalized];
        process.stdout.write(
          `${normalized === 'token' ? maskToken(v) : v || ''}\n`,
        );
        return;
      }
      printSection('Effective config');
      printKeyValue([
        ['domain', cfg.domain],
        ['organizationId', cfg.organizationId],
        ['defaultNamespaceId', cfg.defaultNamespaceId || ''],
        ['token', maskToken(cfg.token)],
      ]);
      process.stdout.write(`\nConfig file: ${getConfigPath()}\n`);
    });

  cmd
    .command('path')
    .description('Print absolute path of the config file')
    .action(() => {
      process.stdout.write(`${getConfigPath()}\n`);
    });
}
