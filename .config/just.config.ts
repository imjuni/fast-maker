/* eslint-disable import/no-extraneous-dependencies */
import { logger, option, series, task } from 'just-scripts';
import { exec } from 'just-scripts-utils';
import * as uuid from 'uuid';

option('env', { default: { env: 'develop' } });

function getEnvironmentPrefix(env: Record<string, string | boolean>): string {
  const envPrefix = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');

  return envPrefix;
}

task('uid', () => {
  const created = uuid.v4();

  console.log(created.toUpperCase());
  console.log(created.replace(/-/g, '').toUpperCase());
});

task('clean', async () => {
  const cmd = 'rimraf dist artifact';

  await exec(cmd, {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('clean:dts', async () => {
  const cmd = 'rimraf dist/src dist/example';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('lint', async () => {
  const cmd = 'eslint --cache --ext ts,tsx,json .';

  await exec(cmd, {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('tsc', async () => {
  const cmd = 'tsc --incremental -p ./tsconfig.json';

  await exec(cmd, {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+dts-bundle', async () => {
  const cmd = 'dts-bundle-generator --no-banner dist/src/fast-maker.d.ts -o dist/fast-maker.d.ts';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('+pub', async () => {
  const cmd = 'npm publish --registry http://localhost:8901 --force';

  await exec(cmd, {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+pub:prod', async () => {
  const cmd = 'npm publish --registry https://registry.npmjs.org --access=public';

  await exec(cmd, {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+build:dev', async () => {
  const env = {
    DEBUG: 'frm:*',
    NODE_ENV: 'production',
  };

  const cmd = `cross-env ${getEnvironmentPrefix(env)} webpack --config ./.config/webpack.config.dev.js`;

  logger.info('Script Build: ', cmd);

  await exec(cmd, {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+build:prod', async () => {
  const env = {
    DEBUG: 'frm:*',
    NODE_ENV: 'production',
  };

  const cmd = `cross-env ${getEnvironmentPrefix(env)} webpack --config ./.config/webpack.config.prod.js`;

  logger.info('Script Build: ', cmd);

  await exec(cmd, {
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('build', series('clean', 'lint', '+build:dev'));
task('pub', series('clean', 'lint', '+build:dev', '+pub'));
task('pub:prod', series('clean', 'lint', '+build:prod', '+pub:prod'));
task('build:dev', series('clean', 'lint', '+build:dev', '+dts-bundle', 'clean:dts'));
task('build:prod', series('clean', 'lint', '+build:prod', '+dts-bundle', 'clean:dts'));
