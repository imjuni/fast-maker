import type { IReason } from '#/compilers/interfaces/IReason';
import { CE_REQUEST_KIND } from '#/compilers/type-tools/const-enum/CE_REQUEST_KIND';
import type { validatePropertySignature } from '#/compilers/validators/validatePropertySignature';
import chalk from 'chalk';
import type * as tsm from 'ts-morph';

export function getPropertySignatureValidateReason(
  kind: CE_REQUEST_KIND,
  node: tsm.FunctionDeclaration | tsm.ArrowFunction,
  valid: ReturnType<typeof validatePropertySignature>,
) {
  const reasons: IReason[] = [];

  if (kind === CE_REQUEST_KIND.PROPERTY_SIGNATURE) {
    const startPos = node.getStart(false);
    const lineAndCharacter = node.getSourceFile().getLineAndColumnAtPos(startPos);

    reasons.push({
      type: 'error',
      filePath: node.getSourceFile().getFilePath().toString(),
      source: node.getSourceFile(),
      node,
      lineAndCharacter: { line: lineAndCharacter.line, character: lineAndCharacter.column },
      message: `A route configuration using the \`fastify.route\` function have to use a \`FastifyRequest\``,
    });
  }

  reasons.push(
    ...valid.fuzzy.map((fuzzyWarn) => {
      const startPos = node.getStart(false);
      const lineAndCharacter = node.getSourceFile().getLineAndColumnAtPos(startPos);

      const reason: IReason = {
        type: 'warn',
        filePath: node.getSourceFile().getFilePath().toString(),
        source: node.getSourceFile(),
        node,
        lineAndCharacter: { line: lineAndCharacter.line, character: lineAndCharacter.column },
        message: `Do you want ${fuzzyWarn.expectName}? "${chalk.yellow(fuzzyWarn.target)}" in source code`,
      };

      return reason;
    }),
  );

  return reasons;
}
