import fs, { promises as fsProm } from 'fs';
import path from 'path';
import semver from 'semver';

const filenameRegex = /^(.*)__(.*).ts$/;

export default async function getMigrations(dir: string) {
  try {
    await fsProm.access(dir, fs.constants.F_OK);
  } catch (e) {
    // directory doesn't exist
    return [];
  }

  return (await fsProm.readdir(dir))
    .filter((filename) => filenameRegex.test(filename))
    .map((filename) => {
      const [, version, description] = filename.match(filenameRegex)!;

      return {
        version,
        path: path.join(dir, filename),
        description: path.basename(description, '.ts'),
      };
    })
    .sort((f1, f2) => semver.compare(f1.version, f2.version));
}
