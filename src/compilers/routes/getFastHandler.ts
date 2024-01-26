import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import { summaryRoutePath } from '#/routes/summaryRoutePath';
import type * as tsm from 'ts-morph';
import { getRouteNode } from './getRouteNode';
import { getRouteOptions } from './getRouteOptions';

export async function getFastHandler(
  project: tsm.Project,
  filePath: string,
  options: { base: Pick<TRouteOption['base'], 'handler' | 'output'> },
) {
  const summary = await summaryRoutePath(filePath, options.base.handler);
  const sourceFile = project.getSourceFileOrThrow(filePath);
  const routeOption = getRouteOptions(sourceFile);
  const routeHandlerNode = getRouteNode(sourceFile);

  console.log(routeOption);
  // console.log(summary);

  /*
  const hash = getHash(routePath.routePath, process.env.HASH_SECRET);
  const parameters = handler.node.getParameters();

  if (parameters.length === 0) {
    return {
      options,
      handler: {
        ...handler,
        import: [],
      },
    };
  }

  const parameter = atOrThrow(parameters, 0);
  const typeReferenceNodes = getTypeReferences(parameter);
  const typeName = getSymbol(parameter)?.getEscapedName();

  // 커스텀 타입일 때, FastifyRequest Generic을 사용하지 않고, 직접 Querystring, Params, Body, Headers를 전달하는 경우
  if (typeName !== 'FastifyRequest') {
    const propertySignatures = getPropertySignatures({ parameter: parameter });
    return {};
  }

  const exportedStatements = getExportedStatements({ sourceFile, typeReferenceNodes });
  const reasons = validateTypeReferences(sourceFile, handler.node, exportedStatements);
  const aa = getResolvedModuleInImports({ sourceFile });

  if (reasons.length > 0) {
    // 오류 발생
    return undefined;
  }

  return undefined;
  */
}
