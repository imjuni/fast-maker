import execa from 'execa';
import { series, task } from 'just-task';
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

task('+pub', async () => {
  const cmd = 'npm publish --registry http://localhost:8901 --force';

  await execa(cmd, {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+pub:prod', async () => {
  const cmd = 'npm publish --registry https://registry.npmjs.org --access=public';

  await execa(cmd, {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+rollup:prod', async () => {
  const cmd = 'rollup';
  const option = '--config ./.configs/rollup.config.prod.ts --configPlugin ts';

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
  const option = '--config ./.configs/rollup.config.dev.ts --configPlugin ts';

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

task('build', series('clean', 'lint', '+tsc'));
task('pub', series('clean', 'lint', '+rollup:dev', '+pub'));
task('pub:prod', series('clean', 'lint', '+rollup:prod', '+pub:prod'));
task('rollup:prod', series('clean', 'lint', '+rollup:prod'));
task('rollup:dev', series('clean', 'lint', '+rollup:dev'));
