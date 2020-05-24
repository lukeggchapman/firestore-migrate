import fs from 'fs';
import path from 'path';
import tsNode from 'ts-node';

/**
 * Gets require's supported extensions
 */
const getSupportedExtensions = () => Object.keys(require.extensions);

/**
 * Registers ts node so that require can interpret typescript
 * uses consumer tsconfig settings to guarantee transpilation
 */
export default function registerTypeScript() {
  // check if ts already supported
  if (getSupportedExtensions().includes('.ts')) return;

  const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json');

  if (fs.existsSync(tsconfigPath)) {
    tsNode.register(require(tsconfigPath));
  } else {
    console.warn('No tsconfig.json for migrations found.');
    tsNode.register();
  }
}
