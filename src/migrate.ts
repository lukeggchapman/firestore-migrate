import { Firestore } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';
import MigrationStore from './utils/MigrationStore';
import getMigrations, { Migration } from './utils/getMigrations';
import registerTypeScript from './utils/registerTypeScript';
import semver from 'semver';

interface MigrateOptions {
  /* Path where the migrations are located */
  path: string;
  /* Version to migrate to, defaults to latest */
  to?: string;
  /* Can pass in admin app if already initialised */
  app?: admin.app.App;
}

interface MigrationItem {
  up: (firestore: Firestore) => void;
  down: (firestore: Firestore) => void;
}

function findPreviousVersion(version: string, migrations: Migration[]) {
  const currentIndex = migrations.findIndex(
    (migration) => migration.version === version
  );

  return currentIndex < 1 ? migrations[currentIndex - 1].version : '0.0.0';
}

export async function migrate({
  path,
  to,
  app = admin.initializeApp(),
}: MigrateOptions) {
  console.log(`Running migrations....`);

  if (to && !semver.valid(to)) {
    throw new Error('to options is not a valid semver version.');
  }

  const firestore = app.firestore();
  const migrations = await getMigrations(path);
  const store = new MigrationStore(firestore);
  let { version: currentVersion } = (await store.get()) ?? { version: '0.0.0' };

  const log = (message: string) => {
    console.log(`Firestore-migrate current version ${currentVersion}`, message);
  };

  let migrationsToRun: Migration[];
  let direction: 'up' | 'down' = 'up';

  if (!to) {
    migrationsToRun = migrations.filter((file) =>
      semver.gt(file.version, currentVersion)
    );
  } else if (semver.lt(to, currentVersion)) {
    direction = 'down';
    migrationsToRun = migrations
      .filter(
        (file) =>
          semver.lte(file.version, currentVersion) &&
          semver.gt(file.version, to)
      )
      .reverse();
  } else {
    migrationsToRun = migrations.filter(
      (file) =>
        semver.gt(file.version, currentVersion) && semver.lte(file.version, to)
    );
  }

  registerTypeScript();

  for (const { version, path, description } of migrationsToRun) {
    const migrationItem: MigrationItem = await import(path);
    const newVersion =
      direction === 'up' ? version : findPreviousVersion(version, migrations);

    try {
      log(`Migrating to ${version} - ${description}`);
      migrationItem[direction](firestore);
    } catch (e) {
      log(`Failed to update to ${version} - ${description}`);
      throw e;
    }

    store.update({ version: newVersion });
    currentVersion = version;
  }

  log('Migration complete');
}
