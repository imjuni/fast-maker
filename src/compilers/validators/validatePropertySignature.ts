import { CE_REQUEST_KIND } from '#/compilers/type-tools/const-enum/CE_REQUEST_KIND';
import { validParamNames } from '#/compilers/validators/validParamNames';
import { fuzzyWithCase, type IFuzzyWithCaseReturn } from '#/tools/fuzzyWithCase';
import { atOrUndefined } from 'my-easy-fp';
import type * as tsm from 'ts-morph';

interface IValidatePropertySignatureParam {
  propertySignatures: tsm.Symbol[];
  kind: CE_REQUEST_KIND;
}

export function validatePropertySignature({ propertySignatures, kind }: IValidatePropertySignatureParam) {
  const names = propertySignatures.map((propertySignature) => propertySignature.getEscapedName());
  const expectNames = kind === CE_REQUEST_KIND.FASTIFY_REQUEST ? validParamNames.fastify : validParamNames.typeLiteral;

  const validNames = names.filter((name) => expectNames.includes(name));
  const anotherNames = names.filter((name) => validNames.includes(name) === false);

  const fuzzyResult = anotherNames.reduce<Record<string, IFuzzyWithCaseReturn>>((aggregated, name) => {
    const fuzzyResults = fuzzyWithCase(expectNames, name).filter((fuzzied) => fuzzied.percent > 0);
    const headFuzzyResult = atOrUndefined(fuzzyResults, 0);

    if (headFuzzyResult != null) {
      return { ...aggregated, [name]: headFuzzyResult };
    }

    return aggregated;
  }, {});

  return {
    valid: validNames.length > 0 && names.length === validNames.length,
    fuzzyValid: validNames.length > 0 && names.length !== validNames.length,
    match: validNames,
    fuzzy: Object.values(fuzzyResult),
  };
}
