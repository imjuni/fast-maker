import { getMethodBar } from '#/modules/getMethodBar';
import { getMethodColor } from '#/modules/getMethodColor';
import chalk from 'chalk';
import { describe, expect, it } from 'vitest';

describe('getMethodColor', () => {
  it('pass - background', () => {
    const c1 = getMethodColor('get', 'background');
    const c2 = getMethodColor('post', 'background');
    const c3 = getMethodColor('put', 'background');
    const c4 = getMethodColor('delete', 'background');
    const c5 = getMethodColor('patch', 'background');
    const c6 = getMethodColor('options', 'background');
    const c7 = getMethodColor('head', 'background');
    const c8 = getMethodColor('search', 'background');

    expect(c1).toEqual('bgBlue');
    expect(c2).toEqual('bgGreen');
    expect(c3).toEqual('bgYellow');
    expect(c4).toEqual('bgRed');
    expect(c5).toEqual('bgCyan');
    expect(c6).toEqual('bgGray');
    expect(c7).toEqual('bgMagenta');
    expect(c8).toEqual('bgMagenta');
  });

  it('pass - foreground', () => {
    const c1 = getMethodColor('get', 'foreground');
    const c2 = getMethodColor('post', 'foreground');
    const c3 = getMethodColor('put', 'foreground');
    const c4 = getMethodColor('delete', 'foreground');
    const c5 = getMethodColor('patch', 'foreground');
    const c6 = getMethodColor('options', 'foreground');
    const c7 = getMethodColor('head', 'foreground');
    const c8 = getMethodColor('search', 'foreground');

    expect(c1).toEqual('blueBright');
    expect(c2).toEqual('greenBright');
    expect(c3).toEqual('yellow');
    expect(c4).toEqual('red');
    expect(c5).toEqual('cyan');
    expect(c6).toEqual('gray');
    expect(c7).toEqual('magenta');
    expect(c8).toEqual('magenta');
  });
});

describe('getMethodBar', () => {
  it('pass', () => {
    const c1 = getMethodBar('get');
    const c2 = getMethodBar('post');
    const c3 = getMethodBar('put');
    const c4 = getMethodBar('delete');
    const c5 = getMethodBar('patch');
    const c6 = getMethodBar('options');
    const c7 = getMethodBar('head');

    console.log(chalk.white.bold[getMethodColor('get', 'background')](c1));
    console.log(chalk.white.bold[getMethodColor('post', 'background')](c2));
    console.log(chalk.white.bold[getMethodColor('put', 'background')](c3));
    console.log(chalk.white.bold[getMethodColor('delete', 'background')](c4));
    console.log(chalk.white.bold[getMethodColor('patch', 'background')](c5));
    console.log(chalk.white.bold[getMethodColor('options', 'background')](c6));
    console.log(chalk.white.bold[getMethodColor('head', 'background')](c7));

    expect(c1).toEqual('    GET    ');
    expect(c2).toEqual('    POST   ');
    expect(c3).toEqual('    PUT    ');
    expect(c4).toEqual('   DELETE  ');
    expect(c5).toEqual('   PATCH   ');
    expect(c6).toEqual('  OPTIONS  ');
    expect(c7).toEqual('    HEAD   ');
  });
});
