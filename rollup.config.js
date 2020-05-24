import typescript from '@rollup/plugin-typescript';

export default {
  input: ['src/cli.ts', 'src/migrate.ts'],
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [typescript()],
};
