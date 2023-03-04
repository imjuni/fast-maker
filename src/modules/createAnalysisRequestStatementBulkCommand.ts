import type IRouteHandler from '#routes/interface/IRouteHandler';
import logger from '#tools/logger';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type { TPickSendMasterToWorkerMessage } from '#workers/interfaces/TSendMasterToWorkerMessage';
import { chunk } from 'my-easy-fp';

const log = logger();

export default function createAnalysisRequestStatementBulkCommand(size: number, handlers: IRouteHandler[]) {
  log.trace(`worker-size: ${size}/ data-size: ${handlers.length}`);

  // use `ANALYSIS_REQUEST_STATEMENT` command
  if (size > handlers.length) {
    log.trace(`using command > ${CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT}`);

    return handlers.map((handler) => {
      return {
        command: CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT,
        data: { filePath: handler.filePath },
      } satisfies TPickSendMasterToWorkerMessage<typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT>;
    });
  }

  log.trace(`using command > ${CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT_BULK}`);

  const chunkSize = Math.ceil(handlers.length / size);
  const handlerChunks = chunk(handlers, chunkSize);

  return handlerChunks.map((handlerChunk) => {
    return {
      command: CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT_BULK,
      data: { filePaths: handlerChunk.map((handler) => handler.filePath) },
    } satisfies TPickSendMasterToWorkerMessage<typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT_BULK>;
  });
}
