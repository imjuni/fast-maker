import logger, { getLogLevel } from '#tools/logging/logger';
import 'jest';

describe('logger', () => {
  test('level', () => {
    const r1 = getLogLevel(20);
    const r2 = getLogLevel('20');
    const r3 = getLogLevel(true);

    expect(r1).toEqual(20);
    expect(r2).toEqual(20);
    expect(r3).toEqual(20);
  });

  test('level - exception', () => {
    try {
      jest.spyOn(Number, 'parseInt').mockImplementationOnce(() => {
        console.log('?');
        throw new Error('want to raise error');
      });

      getLogLevel('20');
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  test('pass - logger', () => {
    const log = logger();

    log.trace('trace');
    log.debug('debug');
    log.verbose('verbose');
    log.info('info');
    log.warn('warn');
    log.error('error');
  });

  test('pass - logger', () => {
    process.env.LOG_LEVEL = 'trace';
    const log = logger();

    log.trace('trace');
    log.debug('debug');
    log.verbose('verbose');
    log.info('info');
    log.warn('warn');
    log.error('error');

    process.env.LOG_LEVEL = 'info';
  });
});
