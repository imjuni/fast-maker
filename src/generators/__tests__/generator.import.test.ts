import getResolvedPaths from '#configs/getResolvedPaths';
import JestContext from '#tools/__tests__/tools/context';
import * as env from '#tools/__tests__/tools/env';
import 'jest';
import path from 'path';
import * as tsm from 'ts-morph';

const context = new JestContext();

beforeAll(async () => {
  context.projectPath = path.join(env.examplePath, 'tsconfig.json');
  context.project = new tsm.Project({ tsConfigFilePath: context.projectPath });
  context.routeOption = {
    ...env.routeOption,
    ...getResolvedPaths({ project: context.projectPath, handler: env.handlerPath, output: env.examplePath }),
  };
});

describe('navigate', () => {
  test('generateRouteFunctionCode', async () => {
    console.log('test');
  });
});
