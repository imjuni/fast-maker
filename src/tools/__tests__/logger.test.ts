import logger, { loggerClear } from '#/tools/logger';
import * as lm from '#/tools/loggerModule';

import 'jest';

describe('logger', () => {
  test('level', () => {
    const r1 = lm.getLogLevel(20);
    const r2 = lm.getLogLevel('20');
    const r3 = lm.getLogLevel(true);

    expect(r1).toEqual(20);
    expect(r2).toEqual(20);
    expect(r3).toEqual(20);
  });

  test('level - exception', () => {
    try {
      const spy = jest.spyOn(Number, 'parseInt').mockImplementationOnce(() => {
        throw new Error('want to raise error');
      });

      lm.getLogLevel('20');

      spy.mockRestore();
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  test('label', () => {
    const r1 = lm.getLogLabel(10);
    const r2 = lm.getLogLabel(999);
    expect(r1).toEqual('trace');
    expect(r2).toEqual('info');
  });

  test('pass - logger', () => {
    const log = logger();

    log.trace('trace');
    log.debug('debug');
    log.verbose('verbose');
    log.info('info');
    log.warn('warn');
    log.error('error');

    loggerClear();
  });

  test('pass - level', () => {
    process.env.LOG_LEVEL = 'trace';

    logger();
    loggerClear();

    process.env.LOG_LEVEL = 'info';
  });

  test('pass - undefined', () => {
    delete process.env.LOG_LEVEL;

    logger();
    loggerClear();
  });

  test('pass - NaN', () => {
    const spy = jest.spyOn(lm, 'getLogLabel').mockImplementation(() => {
      console.log('왜?');
      return 'asdf';
    });

    const spy2 = jest.spyOn(lm, 'getLogLevel').mockImplementation(() => {
      console.log('왜?');
      return 10;
    });

    const log = logger();
    log.trace('trace');
    log.debug('debug');
    log.verbose('verbose');
    loggerClear();

    spy.mockRestore();
    spy2.mockRestore();
  });
});
