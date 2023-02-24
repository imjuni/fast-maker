import validParamNames from '#compilers/validators/validParamNames';
import fuzzyWithCase, { type IFuzzyWithCaseReturn } from '#tools/fuzzyWithCase';
import type { Symbol } from 'ts-morph';

interface IValidatePropertySignatureParam {
  propertySignatures: Symbol[];
  type: 'FastifyRequest' | 'ObjectType';
}

export default function validatePropertySignature({ propertySignatures, type }: IValidatePropertySignatureParam) {
  const names = propertySignatures.map((propertySignature) => propertySignature.getEscapedName());
  const expectNames = type === 'FastifyRequest' ? validParamNames.fastify : validParamNames.custom;

  const validNames = names.filter((name) => expectNames.includes(name));
  const anotherNames = names.filter((name) => validNames.includes(name) === false);

  const fuzzyResult = anotherNames.reduce<Record<string, IFuzzyWithCaseReturn>>((aggregated, name) => {
    const fuzzyResults = fuzzyWithCase(expectNames, name).filter((fuzzied) => fuzzied.percent > 0);
    const [headFuzzyResult] = fuzzyResults;

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
