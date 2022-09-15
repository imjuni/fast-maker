import { nodeResolve } from '@rollup/plugin-node-resolve';
import readPackage from 'read-pkg';
import ts from 'rollup-plugin-ts';

const pkg = readPackage.sync();

export default [
  {
    input: 'src/cli.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      banner: '#!/usr/bin/env node',
    },
    plugins: [
      nodeResolve({
        resolveOnly: (module) => {
          const isLocal = pkg?.dependencies?.[module] == null && pkg?.devDependencies?.[module] == null;
          return isLocal;
        },
      }),
      ts({ tsconfig: 'tsconfig.prod.json' }),
    ],
  },
  {
    input: 'src/fast-maker.ts',
    output: [
      {
        format: 'cjs',
        file: 'dist/cjs/fast-maker.js',
        sourcemap: true,
      },
      {
        format: 'esm',
        file: 'dist/esm/fast-maker.js',
        sourcemap: true,
      },
    ],

    plugins: [
      nodeResolve({
        resolveOnly: (module) => {
          const isLocal = pkg?.dependencies?.[module] == null && pkg?.devDependencies?.[module] == null;
          return isLocal;
        },
      }),
      ts({ tsconfig: 'tsconfig.prod.json' }),
    ],
  },
];
