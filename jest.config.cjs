/* eslint-disable import/no-extraneous-dependencies */

const { pathsToModuleNameMapper } = require('ts-jest');
const { parse } = require('jsonc-parser');
const fs = require('fs');

// https://kulshekhar.github.io/ts-jest/docs/getting-started/paths-mapping/#jest-config-with-helper
// tsconfig.json 파일에 주석 때문에 상단 링크 문서가 설명하는 것과 같이 바로 require로 불러올 수 없었다.
const tsconfig = parse(fs.readFileSync('./tsconfig.json').toString());

module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/__tests__/*.(ts|tsx)', '**/__test__/*.(ts|tsx)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    'example/',
    'dist/',
    'src/tools/__tests__/context.ts',
    'src/tools/__tests__/env.ts',
    'src/tools/__tests__/getTestValue.ts',
    'src/tools/__tests__/getData.ts',
    'src/tools/__tests__/saveData.ts',
  ],
  setupFilesAfterEnv: ['./.configs/jest.setup.cjs'],
  // testSequencer: './test.spec.cjs',
  // moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths),

  // 아래처럼 prefix를 직접 설정할 수 있다, 내 경우에는 이렇게 해야지만 제대로 동작했다
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/' }),
};
