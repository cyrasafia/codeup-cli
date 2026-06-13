import { api } from '../../client.js';
import {
  pickRepoSummary,
  printJson,
  printKeyValue,
  printSection,
} from '../../format.js';

export function registerRepoGetCommand(program) {
  program
    .command('get')
    .description('Show repository details by ID or namespace/path')
    .argument('<repoId>', 'numeric repository ID or "namespace/path"')
    .option('--json', 'print raw JSON response')
    .action(async (repoId, opts) => {
      const { data } = await api.getRepository(repoId);

      if (opts.json) {
        printJson(data);
        return;
      }

      printSection('Repository');
      printKeyValue(pickRepoSummary(data));

      if (data.namespace) {
        printSection('Namespace');
        printKeyValue([
          ['ID', data.namespace.id],
          ['Name', data.namespace.name],
          ['Path', data.namespace.path],
          ['Visibility', data.namespace.visibility],
          ['Description', data.namespace.description],
        ]);
      }

      if (data.owner) {
        printSection('Owner');
        printKeyValue([
          ['ID', data.owner.id],
          ['User ID', data.owner.userId],
          ['Username', data.owner.username],
          ['Name', data.owner.name],
          ['Email', data.owner.email],
          ['State', data.owner.state],
        ]);
      }

      if (data.permissions) {
        printSection('Permissions');
        const group = data.permissions.groupAccess;
        const project = data.permissions.projectAccess;
        printKeyValue([
          ['Group access level', group ? group.accessLevel : undefined],
          ['Project access level', project ? project.accessLevel : undefined],
          ['Allow push', data.allowPush],
        ]);
      }
    });
}
