import logger from '#/tools/logger';
import FastMakerEmitter from '#/workers/FastMakerEmitter';
import type TSendMasterToWorkerMessage from '#/workers/interfaces/TSendMasterToWorkerMessage';
import { isError } from 'my-easy-fp';

const log = logger();

export default async function worker() {
  const emitter: FastMakerEmitter = new FastMakerEmitter();

  process.on('message', (payload: TSendMasterToWorkerMessage) => {
    try {
      log.trace(`worker message-01: ${typeof payload}-${payload.command}`);

      if ('data' in payload) {
        emitter.emit(payload.command, payload.data);
      } else {
        emitter.emit(payload.command);
      }
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));

      log.trace(err.message);
      log.trace(err.stack);
    }
  });
}
