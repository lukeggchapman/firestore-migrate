import { Firestore } from '@google-cloud/firestore';
import admin from 'firebase-admin';
import MigrationStore from './utils/MigrationStore';
import getMigrations from './utils/getMigrations';
import registerTypeScript from './utils/registerTypeScript';
import semver from 'semver';

interface MigrateOptions {
  /* Path where the migrations are located */
  path: string;
  /* Version to migrate to, defaults to latest */
  to?: string;
}

interface MigrationItem {
  up: (firestore: Firestore) => void;
  down: (firestore: Firestore) => void;
}

export async function migrate({ path, to }: MigrateOptions) {
  console.log(`Running migrations....`);

  if (!semver.valid(to)) {
    throw new Error('to options is not a valid semver version.');
  }

  const app = admin.initializeApp();
  const firestore = app.firestore();
  let migrations = await getMigrations(path);
  const store = new MigrationStore(firestore);
  let { version: currentVersion } = (await store.get()) ?? { version: '0.0.0' };

  const log = (message: string) => {
    console.log(`Firestore-migrate current version ${currentVersion}`, message);
  };

  if (!to) {
    migrations = migrations.filter((file) =>
      semver.gt(file.version, currentVersion)
    );
  } else if (semver.lt(to, currentVersion)) {
    migrations = migrations
      .filter(
        (file) =>
          semver.lt(file.version, currentVersion) && semver.gt(file.version, to)
      )
      .reverse();
  } else {
    migrations = migrations.filter(
      (file) =>
        semver.gt(file.version, currentVersion) && semver.lte(file.version, to)
    );
  }

  registerTypeScript();

  for (const { version, path, description } of migrations) {
    const migrationItem: MigrationItem = await import(path);

    try {
      log(`Migrating to ${version} - ${description}`);
      migrationItem.up(firestore);
    } catch (e) {
      log(`Failed to update to ${version} - ${description}`);
      throw e;
    }

    store.update({ version });
    currentVersion = version;
  }

  log('Migration complete');
}
