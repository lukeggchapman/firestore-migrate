import { Firestore } from '@google-cloud/firestore';
import admin from 'firebase-admin';
import MigrationStore from './utils/MigrationStore';
import getMigrations from './utils/getMigrations';
import registerTypeScript from './utils/registerTypeScript';
import semver from 'semver';

interface MigrateOptions {
  path: string;
}

interface MigrationItem {
  up: (firestore: Firestore) => void;
  down: (firestore: Firestore) => void;
}

export default async function migrate({ path }: MigrateOptions) {
  console.log(`Running migrations....`);

  const app = admin.initializeApp();
  const firestore = app.firestore();
  const migrations = await getMigrations(path);
  const store = new MigrationStore(firestore);
  let { version: currentVersion } = (await store.get()) ?? { version: '0.0.0' };

  const log = (message: string) => {
    console.log(`Firestore-migrate current version ${currentVersion}`, message);
  };

  migrations.filter((file) => semver.gt(file.version, currentVersion));

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
