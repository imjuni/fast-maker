import generateRouting from '#route/generateRouting';
import loseAbleStringfiy from '#tool/loseAbleStringfiy';
import { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/CE_SEND_TO_PARENT_COMMAND';
import type IFailDoWorkReply from '#worker/interface/IFailDoWorkReply';
import type IFromParentDoWork from '#worker/interface/IFromParentDoWork';
import type IPassDoWorkReply from '#worker/interface/IPassDoWorkReply';
import fs from 'fs';
import { isFail } from 'my-only-either';

export default async function doWork(args: IFromParentDoWork['data']) {
  const routing = await generateRouting(args.config, [args.method]);

  if (isFail(routing)) {
    process.send?.({
      command: CE_SEND_TO_PARENT_COMMAND.RECEIVE_REPLY,
      data: {
        type: 'fail',
        method: args.method,
        fail: {
          err: routing.fail.err,
          log: routing.fail.log.toObject(),
        },
      } satisfies IFailDoWorkReply,
    });
  } else {
    fs.writeFileSync(
      'test.json',
      loseAbleStringfiy({
        type: 'pass',
        method: args.method,
        pass: {
          route: routing.pass.route,
          log: routing.pass.log.toObject(),
        },
      }),
    );

    process.send?.({
      command: CE_SEND_TO_PARENT_COMMAND.RECEIVE_REPLY,
      data: {
        type: 'pass',
        method: args.method,
        pass: {
          route: routing.pass.route,
          log: routing.pass.log.toObject(),
        },
      } satisfies IPassDoWorkReply,
    });
  }
}
