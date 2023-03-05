import execa from 'execa';
import { series, task } from 'just-task';
import readPkg from 'read-pkg';
import * as uuid from 'uuid';

function splitArgs(args: string): string[] {
  return args
    .split(' ')
    .map((line) => line.trim())
    .filter((line) => line != null && line !== '');
}

task('uid', () => {
  const created = uuid.v4();

  console.log(created.toUpperCase());
  console.log(created.replace(/-/g, '').toUpperCase());
});

task('clean', async () => {
  const cmd = 'rimraf';
  const option = 'dist artifact';

  await execa(cmd, splitArgs(option), {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('clean:dts', async () => {
  const cmd = 'rimraf';
  const option = 'dist/cjs/src dist/esm/src dist/src';

  await execa(cmd, splitArgs(option), {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('lint', async () => {
  const cmd = 'eslint';
  const option = '--cache .';

  await execa(cmd, splitArgs(option), {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('prettier', async () => {
  const cmd = 'prettier';
  const option = '--write src/**/*.ts';

  await execa(cmd, splitArgs(option), {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('ctix:single', async () => {
  const cmd = 'ctix';
  const option = 'single -p ./tsconfig.prod.json --config ./.configs/.ctirc';

  await execa(cmd, splitArgs(option), {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('ctix:remove', async () => {
  const cmd = 'ctix';
  const option = 'remove -p ./tsconfig.json --config ./.configs/.ctirc';

  await execa(cmd, splitArgs(option), {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+pub', async () => {
  const cmd = 'npm';
  const option = 'publish --registry http://localhost:8901 --force';

  await execa(cmd, splitArgs(option), {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+pub:prod', async () => {
  const cmd = 'npm';
  const option = 'publish --registry https://registry.npmjs.org --access=public';

  await execa(cmd, splitArgs(option), {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('unpub', async () => {
  const packageJson = readPkg.sync();
  const cmd = 'npm';
  const option = `unpublish ${packageJson.name}@${packageJson.version} --registry http://localhost:8901`;

  await execa(cmd, splitArgs(option), {
    env: {
      NODE_ENV: 'production',
      RELEASE_MODE: 'true',
    },
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+rollup:prod', async () => {
  const cmd = 'rollup';
  const option = '--config ./.configs/rollup.config.prod.ts --configPlugin typescript';

  await execa(cmd, splitArgs(option), {
    env: {
      DEBUG: 'frm:*',
      NODE_ENV: 'production',
    },
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+rollup:dev', async () => {
  const cmd = 'rollup';
  const option = '--config ./.configs/rollup.config.dev.ts --configPlugin typescript';

  await execa(cmd, splitArgs(option), {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+tsc', async () => {
  const cmd = 'tsc';
  const option = '--project ./tsconfig.json  --incremental';

  await execa(cmd, splitArgs(option), {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('build', series('clean', '+tsc'));
task('rollup:dev', series('clean', 'lint', 'ctix:single', '+rollup:dev', 'ctix:remove', 'clean:dts'));
task('rollup:prod', series('clean', 'lint', 'ctix:single', '+rollup:prod', 'ctix:remove', 'clean:dts'));
task('pub', series('rollup:prod', '+pub'));
task('pub:prod', series('rollup:prod', '+pub:prod'));
task('repub', series('unpub', 'pub'));
