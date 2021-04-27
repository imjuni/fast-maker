import debug from 'debug';
import * as path from 'path';

const logChannel = 'frm';

/**
 * @param channel channel of the debug message
 */
export default function ll(filename: string, extname?: string): debug.IDebugger {
  const forceEnableDebugLog = process.env.FORCE_ENABLE_DEBUG_LOG ?? 'off';
  if (forceEnableDebugLog === 'on') {
    return debug(`${logChannel}:${path.basename(filename, extname ?? '.ts')}`);
  }

  const forceDisableDebugLog = process.env.FORCE_DISABLE_DEBUG_LOG ?? 'off';
  if (forceDisableDebugLog === 'on') {
    const nulllog: any = () => undefined; // eslint-disable-line
    return nulllog;
  }

  return debug(`${logChannel}:${path.basename(filename, extname ?? '.ts')}`);
}
