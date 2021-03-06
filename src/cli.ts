import program from 'commander';
import { create } from './create';
import { migrate } from './migrate';

program
  .command('create <name> <version>')
  .option('-p, --path <path>', 'Path to migration files', './migrations')
  .action(create);

program
  .command('migrate')
  .option('-t, --to <to>', 'Semver version to migrate to')
  .option('-p, --path <path>', 'Path to migration files', './migrations')
  .action(migrate);

program.parse(process.argv);
