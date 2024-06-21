import type { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'cjs/index.js',
      format: 'cjs',
    },
    {
      dir: 'mjs/index.mjs',
      format: 'esm',
    },
  ],
  plugins: [typescript({ tsconfig: 'tsconfig.build.json' })],
} satisfies RollupOptions;
