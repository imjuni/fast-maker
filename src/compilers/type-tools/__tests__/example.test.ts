import { getRouteFunctionOrThrow } from '#/compilers/routes/getRouteFunctionOrThrow';
import { getRequestTypeParameter } from '#/compilers/type-tools/getRequestTypeParameter';
import { atOrThrow } from 'my-easy-fp';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, it } from 'vitest';

const tsconfigDir = path.join(process.cwd(), 'examples');
const tsconfigPath = path.join(tsconfigDir, 'tsconfig.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigPath });
// const context: { index: number } = { index: 0 };

// project://examples/handlers/dc/world/post.ts
describe('getRequestTypeParameter', () => {
  it('type-literal with mapped access', () => {
    const sourceFilePath = path.join(tsconfigDir, 'handlers', 'dc', 'world', 'post.ts');
    const sourceFile = project.getSourceFileOrThrow(sourceFilePath);

    console.log(sourceFile.getFilePath().toString());

    const node = getRouteFunctionOrThrow(sourceFile);
    const parameter = atOrThrow(node.node.getParameters(), 0);

    getRequestTypeParameter(parameter);
  });
});
