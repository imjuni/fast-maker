import { show } from '#/cli/display/show';
import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { getCwd } from '#/modules/files/getCwd';
import chalk from 'chalk';
import fastGlob from 'fast-glob';
import fastSafeStringify from 'fast-safe-stringify';
import inquirer from 'inquirer';
import { exists, isDescendant } from 'my-node-fp';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function initCommandSyncHandler() {
  const cwd = getCwd(process.env);
  // find tsconfig.json
  const tsconfigFilePaths = await fastGlob(['**/tsconfig.json', '**/tsconfig.*.json'], {
    cwd,
    ignore: ['node_modules'],
  });

  const tsconfigAnswer = await inquirer.prompt<{
    tsconfigFilePath: string;
  }>([
    {
      type: 'list',
      name: 'tsconfigFilePath',
      message: 'Select your tsconfig.json file: ',
      choices: tsconfigFilePaths,
    },
  ]);

  // find handler directory
  const handlerAnswer = await inquirer.prompt<{
    handlerHave: string;
    handlerDirectory: string;
  }>([
    {
      type: 'list',
      name: 'handlerHave',
      message: `Do you already have a ${chalk.bold('handler')} directory?`,
      choices: ['yes', 'no'],
    },
    {
      type: 'list',
      name: 'handlerDirectory',
      message: `Select your ${chalk.blueBright.bold('handler')} directory: `,
      choices: async () => {
        const dirnames = await fastGlob(['**'], {
          cwd,
          onlyDirectories: true,
          ignore: ['node_modules'],
        });

        return dirnames;
      },
      when: (context) => {
        return context.handlerHave === 'yes';
      },
    },
    {
      type: 'input',
      name: 'handlerDirectory',
      message: `Enter your ${chalk.blueBright.bold('handler')} directory: `,
      when: (context) => {
        return context.handlerHave !== 'yes';
      },
    },
  ]);

  const handlerDirectory =
    handlerAnswer.handlerHave === 'yes'
      ? path.join(cwd, handlerAnswer.handlerDirectory)
      : handlerAnswer.handlerDirectory;

  if (isDescendant(cwd, handlerDirectory) === false) {
    show('warn', `${chalk.bgYellowBright('   Warn   ')} "${handlerDirectory}" is dosen't under ${cwd}`);

    const notDescendantAnswer = await inquirer.prompt<{
      goAhead: string;
    }>([
      {
        type: 'list',
        name: 'goAhead',
        message: 'Do you want to contine?',
        choices: ['yes', 'no'],
      },
    ]);

    if (notDescendantAnswer.goAhead !== 'yes') {
      process.exit(1);
    }
  }

  if ((await exists(handlerAnswer.handlerDirectory)) === false) {
    await fs.mkdir(handlerAnswer.handlerDirectory, { recursive: true });
  }

  // select output directory
  const outputAnswer = await inquirer.prompt<{
    outputDirectory: string;
  }>([
    {
      type: 'list',
      name: 'outputDirectory',
      message: `Select your ${chalk.cyanBright.bold('output')} directory: `,
      choices: async () => {
        const dirnames = await fastGlob(['**'], {
          cwd,
          onlyDirectories: true,
          ignore: ['node_modules'],
        });

        return dirnames;
      },
    },
  ]);

  await fs.writeFile(
    path.join(cwd, CE_DEFAULT_VALUE.CONFIG_FILE_NAME),
    fastSafeStringify(
      {
        project: tsconfigAnswer.tsconfigFilePath,
        handler: handlerAnswer.handlerDirectory,
        output: outputAnswer.outputDirectory,
        'route-map': true,
        'cli-logo': false,
      },
      undefined,
      2,
    ),
  );

  show('log', `${chalk.greenBright(CE_DEFAULT_VALUE.CONFIG_FILE_NAME)} created`);
}
