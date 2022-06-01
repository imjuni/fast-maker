import validParamNames from '@compiler/validation/validParamNames';
import fuzzyWithCase, { type IFuzzyWithCaseReturn } from '@tool/fuzzyWithCase';
import { isFalse, isNotEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

interface IValidatePropertySignatureParam {
  propertySignatures: tsm.Symbol[];
  type: 'FastifyRequest' | 'ObjectType';
}

export default function validatePropertySignature({ propertySignatures, type }: IValidatePropertySignatureParam) {
  const names = propertySignatures.map((propertySignature) => propertySignature.getEscapedName());
  const expectNames = type === 'FastifyRequest' ? validParamNames.fastify : validParamNames.custom;

  const validNames = names.filter((name) => expectNames.includes(name));
  const anotherNames = names.filter((name) => isFalse(validNames.includes(name)));

  const fuzzyResult = anotherNames.reduce<Record<string, IFuzzyWithCaseReturn>>((aggregated, name) => {
    const fuzzyResults = expectNames
      .map((expectName) => fuzzyWithCase(expectName, name))
      .filter((fuzzied) => fuzzied.score > 0 || fuzzied.score === 0);

    const [headFuzzyResult] = fuzzyResults;

    if (isNotEmpty(headFuzzyResult)) {
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
