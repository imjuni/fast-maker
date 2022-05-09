import IReason from '@compiler/interface/IReason';
import { IHandlerStatement, IOptionStatement } from '@compiler/interface/THandlerNode';
import getHandlerWithOption from '@compiler/navigate/getHandlerWithOption';
import ErrorWithMessage from '@module/ErrorWithMessage';
import { IOption } from '@module/IOption';
import IRouteHandler from '@route/interface/IRouteHandler';
import getHash from '@tool/getHash';
import requestHandlerAnalysisMachine, {
  IContextRequestHandlerAnalysisMachine as IAnalysisMachineContext,
} from '@xstate/RequestHandlerAnalysisMachine';
import consola from 'consola';
import { isEmpty } from 'my-easy-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as tsm from 'ts-morph';
import { interpret } from 'xstate';

interface IGetSourceTextParam {
  routeHandlerWithOption: IRouteHandler;
  option: IOption;
  project: tsm.Project;
}

export default async function getSourceText({
  routeHandlerWithOption,
  option,
  project,
}: IGetSourceTextParam): Promise<
  PassFailEither<Error, Pick<IAnalysisMachineContext, 'importBox' | 'routeBox' | 'messages'>>
> {
  try {
    const source = project.getSourceFile(routeHandlerWithOption.filename);

    if (isEmpty(source)) {
      return fail(new Error(`Source-code is empty: ${routeHandlerWithOption.filename}`));
    }

    const hash = getHash(source.getFilePath().toString());
    const nodes = getHandlerWithOption(source);
    const routeHandler = nodes.find((node): node is IHandlerStatement => node.kind === 'handler');
    const routeOption = nodes.find((node): node is IOptionStatement => node.kind === 'option');

    if (isEmpty(routeHandler)) {
      const reason: IReason = {
        type: 'error',
        filePath: source.getFilePath().toString(),
        source,
        message: `Cannot found route handler function: ${source.getFilePath().toString()}`,
      };

      return fail(new ErrorWithMessage(reason.message, reason));
    }

    const machine = requestHandlerAnalysisMachine({
      project,
      source,
      hash,
      routeHandler: routeHandlerWithOption,
      handler: routeHandler,
      routeOption,
      option,
    });

    const service = interpret(machine);

    const parsedDataBox = await new Promise<Pick<IAnalysisMachineContext, 'importBox' | 'routeBox' | 'messages'>>(
      (resolve) => {
        service.onDone((data) => resolve(data.data));
        service.start();
      },
    );

    return pass(parsedDataBox);
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');
    consola.debug(err);

    return fail(err);
  }
}

/*
https://ts-ast-viewer.com/#code/MYewdgzgLgBAFgQzAEwDYFMBOMC8MAUAlLgHwwDeAvgFDUCWYUWAZgsOjAJICKArlgE9omBgHMK1GFJgB6AFRzJ0mHJgABALYIAHgBl0YUVDgwATAFZzS6XJnWYYBBvQAuGMLEBuajWoIIAmDAMMy8QVB04PDoqKgg+EqY6ACObgBi-hHMAgBKKfzQADzkMHyCHoZunHnJAAogANboABIxcQDaAORlmEJQIoadALqeMABCIMgCVTX1Ta2xIF0TU8MwlCQANEoyMjBJAA6o0zAZ0HTZeUcC28TkSqCQIBgAdMjoAEa8ovhJyS-Jfi9QjeKSPCDPdBvT7fX4pF4fSYCEG0KRJKC8TBgGCdOBtECdby+ajobQHECYWDvVi8VCwRAoDCYTxAA

아래처럼 Generic으로 타입을 전달하는 경우, TypeReference 아래 TypeLiteral이 추가된다
TypeLiteral이 추가된 경우 그 안에 내용을 읽어서 Querystring, Body, Param, Header 내용을 분석해야하고 
그게 아니면 패스. 그리고 앞서 언급한 4가지 외 나머지는 있어도 필요 없다

export default async function hello(
  req: FastifyRequest<{ Querystring: IReqPokeHello['Querystring']; Body: IReqPokeHello['Body'] }>,
  // reply: FastifyReply,
) {
  console.debug(req.query);
  console.debug(req.body);

  return 'hello';
}

req, reply는 parameters 배열에 포함된다. req는 0번, reply는 1번 이렇게 들어간다. 순서대로 들어간다.

req는 SyntaxKind.Parameter, 163번이다. name이 IdentifierObject로 저장되고 여기에서 req라는 이름을 얻을 수 있다.
req는 type 필드를 가지며, SyntaxKind.TypeReference 177번 값을 가진다.

statement.statement.parameters[0].type.typeArguments

typeArguments는 배열이고, Generic에서 여러개를 전달할 수 있으니 그걸 뜻한다. 그리고 정상적인 상황이라면
0번이 Request Type Arguments 이다. 문법적으로 보면 이건 TypeLiteral 이다. 이건 내가 편의로 상정한 경우이며
interface가 reference로 올 수 있다. 이 경우 TypeReference가 다시 찍힌다.
*/
