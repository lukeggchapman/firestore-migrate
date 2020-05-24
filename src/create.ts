import semver, { ReleaseType } from 'semver';
import mkdirp from 'mkdirp';
import getMigrations from './utils/getMigrations';
import fsProm from './utils/fsPromise';

interface CreateOptions {
  path: string;
}

const releaseType: ReleaseType[] = [
  'major',
  'premajor',
  'minor',
  'preminor',
  'patch',
  'prepatch',
  'prerelease',
];
function isReleaseType(release: string): release is ReleaseType {
  return releaseType.includes(release as any);
}
const nameRegex = /^[a-z0-9\-]*$/;

export default async function create(
  name: string,
  release: string,
  { path }: CreateOptions
) {
  if (!nameRegex.test(name)) {
    throw new Error(
      'Migration name should only containe a-z, 0-9 and hyphens only.'
    );
  }
  if (!isReleaseType(release)) {
    throw new Error(`Release must be one of: ${releaseType.join(',')}.`);
  }

  const prevVersion =
    (await getMigrations(path)).slice(-1)[0]?.version ?? '0.0.0';

  const newVersion = semver.inc(prevVersion, release);
  const newMigration = `${path}/${newVersion}__${name}.ts`;

  await mkdirp(path);
  fsProm.copyFile(`${__dirname}/template.ts`, newMigration);

  console.log(`New migration: ${newMigration}`);
}
