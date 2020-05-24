import * as fs from 'fs';
import * as path from 'path';
import * as tsNode from 'ts-node';

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

  if (!fs.existsSync(tsconfigPath))
    throw new Error(`No tsconfig exists in ${process.cwd()}`);

  const tsconfig = require(tsconfigPath);

  tsNode.register(tsconfig);
}
