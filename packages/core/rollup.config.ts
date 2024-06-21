import type { RollupOptions } from 'rollup';

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
} satisfies RollupOptions;
